import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "netronix_admin_token";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "netronix-super-secure-admin-secret-replace-in-env";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run middleware on /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY, { algorithms: ["HS256"] });
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  // 1. If trying to access login while already authenticated, redirect to /admin
  if (isLoginPage && isValid) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 2. If trying to access protected admin page without valid session, redirect to login
  if (!isLoginPage && !isValid) {
    const loginUrl = new URL("/admin/login", req.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
