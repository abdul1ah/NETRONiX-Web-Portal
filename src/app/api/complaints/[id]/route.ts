import { NextRequest, NextResponse } from "next/server";

// ─── Status progression timing (mock) ────────────────────────────────────────
//
// Simulates realistic status transitions after submission.
// FastAPI equivalent: GET /complaints/{id} → from database
//
// Transition timeline:
//   0-30s   → "reported"
//   30s-2m  → "assigned"
//   2m-10m  → "in_progress"
//   10m+    → "resolved"

type ComplaintStatus = "reported" | "assigned" | "in_progress" | "resolved";

function getMockStatus(createdAt: string): ComplaintStatus {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageSecs = ageMs / 1000;

  if (ageSecs < 30)   return "reported";
  if (ageSecs < 120)  return "assigned";
  if (ageSecs < 600)  return "in_progress";
  return "resolved";
}

// Shared in-memory store reference (same module scope as route.ts)
// In production, replace with a DB query.
// Note: In Next.js dev mode, this is the same module instance.
// When deploying to serverless, this won't persist — use a real DB.

// ─── GET /api/complaints/[id] ─────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !id.startsWith("NX-")) {
    return NextResponse.json(
      { message: "Complaint not found" },
      { status: 404 }
    );
  }

  // Mock: derive a fake createdAt from the ID's timestamp portion
  // In production, look up the actual record from DB
  const mockCreatedAt = (() => {
    try {
      // ID format: NX-<base36 timestamp>
      const tsBase36 = id.replace("NX-", "").toLowerCase();
      const ts = parseInt(tsBase36, 36);
      return !isNaN(ts) ? new Date(ts).toISOString() : new Date(Date.now() - 60000).toISOString();
    } catch {
      return new Date(Date.now() - 60000).toISOString();
    }
  })();

  const status    = getMockStatus(mockCreatedAt);
  const updatedAt = new Date().toISOString();

  const estimatedResolution = (() => {
    if (status === "resolved") return undefined;
    const etaMs = status === "reported"
      ? 10 * 60 * 1000
      : status === "assigned"
      ? 8 * 60 * 1000
      : 5 * 60 * 1000;
    return new Date(Date.now() + etaMs).toISOString();
  })();

  return NextResponse.json({
    id,
    status,
    updatedAt,
    estimatedResolution,
  });
}
