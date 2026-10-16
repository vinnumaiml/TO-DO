import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_NAME = "todo_token";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_default_todo_app_secret_key_2026"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Support /signin and /sign-in aliases -> redirect directly to /login
  if (pathname === "/signin" || pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Auth pages & Auth API routes are always open and accessible
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";
  const isApiAuthRoute = pathname.startsWith("/api/auth");

  if (isAuthPage || isApiAuthRoute) {
    return NextResponse.next();
  }

  // Verify JWT session for protected routes (e.g. /profile, /api/tasks)
  // Check cookie or Authorization header
  let token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Protect /profile explicitly if not authenticated
  if (!isAuthenticated && pathname.startsWith("/profile")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
