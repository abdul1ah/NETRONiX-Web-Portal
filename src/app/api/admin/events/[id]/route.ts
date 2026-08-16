import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

/**
 * PATCH /api/admin/events/[id]
 *
 * The endpoint behind the Coming Soon / Live Now switches and the go-live
 * date pickers in the portal. Every field is optional: send only what changed.
 */

const nullableDate = z
  .union([z.string().datetime({ offset: true }), z.literal(""), z.null()])
  .transform((v) => (v === "" || v === null ? null : v))
  .optional();

const UpdateSchema = z.object({
  status:            z.enum(["coming_soon", "live", "past"]).optional(),
  auto_live_at:      nullableDate,
  auto_close_at:     nullableDate,
  registration_open: z.boolean().optional(),
  max_registrations: z.number().int().positive().nullable().optional(),
  title:             z.string().trim().min(1).max(150).optional(),
  subtitle:          z.string().trim().max(150).nullable().optional(),
  description:       z.string().trim().max(2000).optional(),
  form_intro:        z.string().trim().max(1000).nullable().optional(),
  sort_order:        z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid update", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[admin events] update failed", error);
    return NextResponse.json(
      { message: "Could not save the change." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event: data });
}

/** DELETE /api/admin/events/[id] — removes the event and all its submissions. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    console.error("[admin events] delete failed", error);
    return NextResponse.json(
      { message: "Could not delete the event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
