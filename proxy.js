import { NextResponse } from "next/server";

const SESSION_COOKIE = "tawa_session";

const PROTECTED_PREFIXES = ["/home", "/orders", "/receipt", "/reserve", "/tables"];

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return NextResponse.next();

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/home/:path*", "/orders/:path*", "/receipt/:path*", "/reserve/:path*", "/tables/:path*"],
};