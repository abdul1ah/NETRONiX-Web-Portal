import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── Schema ──────────────────────────────────────────────────────────────────

const ComplaintSchema = z.object({
  name:        z.string().min(2).max(100),
  location:    z.string().min(2).max(100),
  issueType:   z.enum(["network", "wifi", "lan", "other"]),
  description: z.string().min(10).max(1000),
});

// ─── In-memory store (mock) ───────────────────────────────────────────────────
// Replace this with a database call when integrating FastAPI.
// FastAPI equivalent: POST /complaints → stored in PostgreSQL/MongoDB

const complaints = new Map<string, {
  id:          string;
  status:      string;
  createdAt:   string;
  data:        z.infer<typeof ComplaintSchema>;
}>();

// ─── POST /api/complaints ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = ComplaintSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const id        = `NX-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    complaints.set(id, {
      id,
      status:    "reported",
      createdAt,
      data:      parsed.data,
    });

    return NextResponse.json(
      {
        id,
        status:    "reported",
        createdAt,
        message:   "Your complaint has been received. Our team will investigate shortly.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }
}

// ─── GET /api/complaints (list) ───────────────────────────────────────────────

export async function GET() {
  return NextResponse.json(
    { count: complaints.size },
    { status: 200 }
  );
}
