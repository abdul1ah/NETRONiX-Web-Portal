import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin, hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

const CreateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "MANAGER"]).default("MANAGER"),
});

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.adminUser.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { assignedComplaints: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { message: "Failed to load staff list" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only full ADMIN role can create new staff users
    if (admin.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Forbidden. Only Administrators can create new staff accounts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid user data" },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // Check if email already registered
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { message: "A staff account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.adminUser.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Staff account created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin user error:", error);
    return NextResponse.json(
      { message: "Failed to create staff account" },
      { status: 500 }
    );
  }
}
