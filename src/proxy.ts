import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, unauthorized, verifySessionToken } from "@/lib/session";

// Blanket guard: every /admin and /api/admin route requires a session unless listed here.
const PUBLIC_PATHS = ["/admin/login", "/api/admin/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) return unauthorized();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
