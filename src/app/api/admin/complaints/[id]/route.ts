import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = id.trim().toUpperCase();

    const complaint = await prisma.complaint.findUnique({
      where: { ticketId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        history: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ message: "Complaint not found" }, { status: 404 });
    }

    return NextResponse.json({ complaint }, { status: 200 });
  } catch (error) {
    console.error("Admin complaint detail error:", error);
    return NextResponse.json(
      { message: "Failed to fetch complaint details" },
      { status: 500 }
    );
  }
}
