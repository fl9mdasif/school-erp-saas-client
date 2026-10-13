import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed middleware to proxy. This is only an optimistic early redirect based on a
// non-secret flag cookie; real protection is the AuthGuard on the client and the API on the server.
const FLAG = "asm_session";

const protectedRoutes = ["/dashboard", "/platform"];
const authRoutes = ["/login", "/platform/login"];

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.get(FLAG)?.value === "1";
  const { pathname } = request.nextUrl;

  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isProtectedRoute =
    !isAuthRoute && protectedRoutes.some((route) => pathname.startsWith(route));

  // 1. Signed-in visitors do not need the login pages
  if (hasSession && isAuthRoute) {
    const target = pathname.startsWith("/platform") ? "/platform" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Signed-out visitors cannot open the app
  if (!hasSession && isProtectedRoute) {
    const target = pathname.startsWith("/platform") ? "/platform/login" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Everything else continues
  return NextResponse.next();
}

// Global matcher for all routes except static assets and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
