import { cookies } from "next/headers";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

// ponytail: in-memory per-IP limiter — resets on restart and isn't shared between instances.
// Move to the DB/Redis if the app runs on more than one process or serverless.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

// Verified against when the username doesn't exist, so response time doesn't reveal valid logins.
const DUMMY_HASH = hashPassword("dummy-password");

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const entry = failures.get(ip);
  if (entry && entry.resetAt <= now) failures.delete(ip);
  else if (entry && entry.count >= MAX_FAILURES) {
    return Response.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return Response.json({ error: "Введите логин и пароль" }, { status: 400 });
  }
  const { username, password } = parsed.data;

  try {
    const admin = await prisma.adminUser.findUnique({ where: { username } });
    const valid = verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
    if (!admin || !valid) {
      const current = failures.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS };
      failures.set(ip, { ...current, count: current.count + 1 });
      return Response.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    failures.delete(ip);
    (await cookies()).set(SESSION_COOKIE, createSessionToken(admin.username), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return Response.json({ username: admin.username });
  } catch (err) {
    console.error("POST /api/admin/login failed:", err);
    return Response.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
