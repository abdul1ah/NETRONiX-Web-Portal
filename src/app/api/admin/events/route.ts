import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

/**
 * POST /api/admin/events — create a new event from the portal.
 *
 * New events start as coming_soon, so nothing goes live by accident.
 * After creating one, run `select public.rebuild_event_views();` in the
 * Supabase SQL editor to give it its own per-event view.
 */

const CreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and dashes only (e.g. hack-n-connect)"
    ),
  title:       z.string().trim().min(2).max(150),
  subtitle:    z.string().trim().max(150).optional(),
  description: z.string().trim().max(2000).default(""),
  image_src:   z.string().trim().max(300).optional(),
  form_intro:  z.string().trim().max(1000).optional(),
  sort_order:  z.number().int().default(100),
});

export async function POST(req: NextRequest) {
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

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Please check the fields.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .insert({ ...parsed.data, status: "coming_soon" })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "An event with that slug already exists." },
        { status: 409 }
      );
    }

    console.error("[admin events] create failed", error);
    return NextResponse.json(
      { message: "Could not create the event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
