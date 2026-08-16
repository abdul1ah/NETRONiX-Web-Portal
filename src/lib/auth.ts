import "server-only";

/**
 * Admin portal authentication.
 *
 * Username + bcrypt password, verified against public.admin_users, then a
 * signed JWT held in an HttpOnly cookie. `jose` is used rather than a Node-only
 * JWT library because proxy.ts runs on the Edge runtime and must verify the
 * same token.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "netronix_admin_session";

export interface AdminSession {
  /** admin_users.id */
  sub: string;
  username: string;
  displayName: string | null;
}

function sessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short. Set at least 32 characters " +
        "in .env.local — generate one with:\n" +
        '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"'
    );
  }

  return new TextEncoder().encode(secret);
}

function sessionHours(): number {
  const raw = Number(process.env.ADMIN_SESSION_HOURS);
  return Number.isFinite(raw) && raw > 0 ? raw : 12;
}

/** True when the server has what it needs to sign sessions. */
export function isAuthConfigured(): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(secret && secret.length >= 32);
}

// ─── Token ───────────────────────────────────────────────────────────────────

export async function createSessionToken(
  session: AdminSession
): Promise<string> {
  return new SignJWT({
    username: session.username,
    displayName: session.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${sessionHours()}h`)
    .sign(sessionSecret());
}

/** Verify a token. Returns null on anything invalid or expired. */
export async function verifySessionToken(
  token: string | undefined
): Promise<AdminSession | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub || typeof payload.username !== "string") return null;

    return {
      sub: payload.sub,
      username: payload.username,
      displayName:
        typeof payload.displayName === "string" ? payload.displayName : null,
    };
  } catch {
    return null;
  }
}

// ─── Cookie helpers (Server Components / Route Handlers) ─────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionHours() * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** The currently logged-in admin, or null. */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for admin API routes. Returns the session, or null if the caller is
 * not authenticated — route handlers turn that into a 401.
 */
export async function requireSession(): Promise<AdminSession | null> {
  return getSession();
}
