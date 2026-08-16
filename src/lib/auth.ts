import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const ADMIN_COOKIE_NAME = "netronix_admin_token";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "netronix-super-secure-admin-secret-replace-in-env";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export interface AdminJWTPayload {
  sub: string; // admin user ID
  email: string;
  name: string;
  role: Role;
}

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Hash a plain text password with salt rounds = 12
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare plain text password with bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a signed JWT session token valid for 7 days
 */
export async function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
}): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Verify a JWT session token
 */
export async function verifySessionToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get authenticated admin from cookies or Authorization header.
 * Verifies existence and active status in PostgreSQL database.
 */
export async function getAuthenticatedAdmin(
  req?: NextRequest
): Promise<AuthenticatedAdmin | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (!token) {
        const authHeader = req.headers.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.sub) return null;

    // Verify user exists and isActive in DB
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) return null;

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  } catch (error) {
    console.error("Authentication verification error:", error);
    return null;
  }
}

/**
 * RBAC Helper: Verify user has required role
 */
export function hasRequiredRole(adminRole: Role, requiredRole: Role): boolean {
  if (adminRole === "ADMIN") return true; // ADMIN has all permissions
  return adminRole === requiredRole;
}
