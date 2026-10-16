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

  // Verify JWT session for protected routes (e.g. /, /profile, /api/tasks)
  const token = request.cookies.get(TOKEN_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // If not authenticated and trying to access protected pages -> redirect to /login
  if (!isAuthenticated && !pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clean up any broken/invalid token cookie
    if (token) {
      response.cookies.set({
        name: TOKEN_NAME,
        value: "",
        expires: new Date(0),
        path: "/",
      });
    }
    return response;
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
