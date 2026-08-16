import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { skillLabel } from "@/lib/events";
import type { RegistrationRow } from "@/lib/supabase/types";

/**
 * GET /api/admin/registrations/export?eventId=...
 *
 * Downloads one event's submissions as CSV — the handoff format for
 * attendance sheets and, later, the mailing list.
 */

const COLUMNS = [
  "Submitted At",
  "Name",
  "Registration Number",
  "Batch",
  "Email",
  "Phone",
  "Hostel",
  "Skills",
  "Other Skill",
  "About NETRONiX",
  "Status",
  "Admin Notes",
] as const;

/** RFC 4180 escaping, plus a guard against spreadsheet formula injection. */
function csvCell(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function toCsvRow(reg: RegistrationRow): string {
  return [
    reg.created_at,
    reg.full_name,
    reg.registration_number,
    reg.batch,
    reg.email,
    reg.phone,
    reg.hostel,
    reg.skills.map(skillLabel).join("; "),
    reg.other_skill,
    reg.about_netronix,
    reg.status,
    reg.admin_notes,
  ]
    .map(csvCell)
    .join(",");
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ message: "eventId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("slug")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin export] fetch failed", error);
    return NextResponse.json(
      { message: "Could not build the export." },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as RegistrationRow[];
  const csv = [COLUMNS.map(csvCell).join(","), ...rows.map(toCsvRow)].join("\r\n");

  // BOM so Excel opens UTF-8 names correctly.
  const filename = `netronix-${event.slug}-registrations.csv`;

  return new NextResponse("﻿" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
