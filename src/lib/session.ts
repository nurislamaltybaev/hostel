import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // seconds: one staff shift

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET (32+ chars) is not set");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Token format: "<base64url JSON {u, exp}>.<HMAC-SHA256>". */
export function createSessionToken(username: string, now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: now + SESSION_MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
): { username: string } | null {
  if (!token) return null;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof u === "string" && typeof exp === "number" && exp > now ? { username: u } : null;
  } catch {
    return null;
  }
}

/** Current admin from the session cookie, or null. For server components and route handlers. */
export async function getAdmin() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export const unauthorized = () => Response.json({ error: "Требуется авторизация" }, { status: 401 });
