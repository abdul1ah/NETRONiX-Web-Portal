import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

/**
 * GET   /api/admin/registrations?eventId=...&q=...&page=0
 * PATCH /api/admin/registrations   { id, status?, admin_notes? }
 *
 * Submissions are always scoped to one event, which is what keeps the portal
 * unambiguous: you are never looking at two events' rows at once.
 */

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const eventId = searchParams.get("eventId");
  const query   = searchParams.get("q")?.trim();
  const page    = Math.max(0, Number(searchParams.get("page") ?? 0) || 0);

  if (!eventId) {
    return NextResponse.json({ message: "eventId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let request = supabase
    .from("registrations")
    .select("*", { count: "exact" })
    .eq("event_id", eventId);

  if (query) {
    // Escape PostgREST's or() delimiters so a stray comma cannot break out.
    const safe = query.replace(/[,()]/g, " ");
    request = request.or(
      `full_name.ilike.%${safe}%,registration_number.ilike.%${safe}%,email.ilike.%${safe}%`
    );
  }

  const { data, error, count } = await request
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (error) {
    console.error("[admin registrations] fetch failed", error);
    return NextResponse.json(
      { message: "Could not load submissions." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    registrations: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum(["pending", "confirmed", "waitlisted", "rejected"])
    .optional(),
  admin_notes: z.string().trim().max(2000).nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid update" }, { status: 400 });
  }

  const { id, ...changes } = parsed.data;

  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .update(changes)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[admin registrations] update failed", error);
    return NextResponse.json(
      { message: "Could not save the change." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ message: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({ registration: data });
}
