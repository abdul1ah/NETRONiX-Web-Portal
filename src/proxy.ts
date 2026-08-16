/**
 * Route protection for the admin portal.
 *
 * In Next.js 16 the `middleware` file convention was renamed to `proxy`.
 * This runs on the Edge runtime before any admin page renders, so an
 * unauthenticated visitor never reaches the portal at all.
 *
 * The JWT is verified here with `jose` (Edge-compatible). The database is
 * never touched at this layer — signature and expiry are enough to gate the
 * route, and every admin API route re-checks the session server-side anyway.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "netronix_admin_session";

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token  = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loggedIn = await hasValidSession(request);

  // Already signed in and hitting the login page → send them to the portal.
  if (pathname === "/admin/login" || pathname === "/admin") {
    if (loggedIn) {
      return NextResponse.redirect(new URL("/admin/portal", request.url));
    }
    // /admin is a convenience alias for the login screen.
    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Everything else under /admin requires a session.
  if (!loggedIn) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on admin pages. The admin API routes guard themselves via
  // requireSession() so they can return a proper 401 instead of a redirect.
  matcher: ["/admin", "/admin/:path*"],
};
