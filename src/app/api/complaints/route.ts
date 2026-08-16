import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateTicketId } from "@/lib/ticket";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendComplaintConfirmationEmail } from "@/lib/email";
import { IssueType, ComplaintStatus } from "@prisma/client";

// ─── Input Schema ────────────────────────────────────────────────────────────

const ComplaintCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(150, "Email cannot exceed 150 characters"),
  location: z.string().trim().min(2, "Location must be at least 2 characters").max(100, "Location cannot exceed 100 characters"),
  issueType: z.enum(["network", "wifi", "lan", "other"]).transform((val) => val.toUpperCase() as IssueType),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters"),
});

// ─── POST /api/complaints ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting: 6 submissions per 10 minutes per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`submit:${clientIp}`, {
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message: `Too many submissions from this connection. Please try again in ${rateLimit.resetInSecs} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Validate request body
    const body = await req.json();
    const parsed = ComplaintCreateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid submission data";
      return NextResponse.json(
        { message: firstError, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, location, issueType, description } = parsed.data;

    // 3. Generate a secure unique ticket ID (with collision check retry)
    let ticketId = generateTicketId();
    let collisionCheck = await prisma.complaint.findUnique({ where: { ticketId } });
    let attempts = 0;
    while (collisionCheck && attempts < 5) {
      ticketId = generateTicketId();
      collisionCheck = await prisma.complaint.findUnique({ where: { ticketId } });
      attempts++;
    }

    // 4. Execute atomic database transaction
    const complaint = await prisma.$transaction(async (tx) => {
      const newComplaint = await tx.complaint.create({
        data: {
          ticketId,
          name,
          email: email.toLowerCase(),
          location,
          issueType,
          description,
          status: ComplaintStatus.REPORTED,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: newComplaint.id,
          previousStatus: null,
          newStatus: ComplaintStatus.REPORTED,
          notes: "Initial submission by student",
        },
      });

      return newComplaint;
    });

    // 5. Trigger email notification asynchronously (safe: never rolls back the DB)
    sendComplaintConfirmationEmail({
      to: email.toLowerCase(),
      studentName: name,
      ticketId: complaint.ticketId,
      location,
      issueType,
      description,
    }).catch((err) => {
      console.error("Async confirmation email error:", err);
    });

    return NextResponse.json(
      {
        id: complaint.id,
        ticketId: complaint.ticketId,
        status: complaint.status.toLowerCase(),
        createdAt: complaint.createdAt.toISOString(),
        message: "Your complaint has been received. Our team will investigate shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint submission error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
