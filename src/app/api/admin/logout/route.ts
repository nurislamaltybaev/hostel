import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Plain <form method="post"> target: clears the cookie and sends the browser to the login page.
export async function POST(request: Request) {
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
