import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SessionPayload } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (Auth pages, landing page, etc.)
  if (
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("session");
    return response;
  }

  // Add the user data to headers for downstream access in Server Components / API Routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role); // Note: This is the JWT role, which might be stale. Use getCurrentUser() for fresh data.
  if (payload.departmentId) {
    requestHeaders.set("x-user-department-id", payload.departmentId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
