import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/server";
import { RegistrationSchema } from "@/lib/validation/registration";
import { isRegistrationOpen } from "@/lib/events";

/**
 * POST /api/events/[slug]/register
 *
 * Public endpoint. Validates the submission, re-checks server-side that the
 * event is actually live (a visitor could POST here regardless of what the UI
 * shows), then inserts the row.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { message: "Registrations are not available yet. Please try again later." },
      { status: 503 }
    );
  }

  // ─── Parse and validate ───────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = RegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Please check the highlighted fields.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // ─── Look up the event and confirm registration is genuinely open ─────────
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id, title, status, auto_live_at, auto_close_at, registration_open, max_registrations"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    console.error("[register] event lookup failed", eventError);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  if (!isRegistrationOpen(event)) {
    return NextResponse.json(
      { message: `Registration for ${event.title} is not open right now.` },
      { status: 409 }
    );
  }

  // ─── Capacity check ───────────────────────────────────────────────────────
  if (event.max_registrations !== null) {
    const { count, error: countError } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);

    if (countError) {
      console.error("[register] capacity check failed", countError);
      return NextResponse.json(
        { message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= event.max_registrations) {
      return NextResponse.json(
        { message: `${event.title} is full. Registration is now closed.` },
        { status: 409 }
      );
    }
  }

  // ─── Insert ───────────────────────────────────────────────────────────────
  const { data: inserted, error: insertError } = await supabase
    .from("registrations")
    .insert({
      event_id:            event.id,
      full_name:           data.fullName,
      registration_number: data.registrationNumber.toUpperCase(),
      batch:               Number(data.batch),
      email:               data.email,
      phone:               data.phone,
      hostel:              data.hostel,
      about_netronix:      data.aboutNetronix,
      skills:              data.skills,
      other_skill:         data.otherSkill?.trim() || null,
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    // 23505 = unique_violation on (event_id, registration_number)
    if (insertError.code === "23505") {
      return NextResponse.json(
        {
          message:
            "You have already registered for this event with that registration number.",
        },
        { status: 409 }
      );
    }

    console.error("[register] insert failed", insertError);
    return NextResponse.json(
      { message: "Could not save your registration. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      id: inserted.id,
      submittedAt: inserted.created_at,
      message: `You are registered for ${event.title}.`,
    },
    { status: 201 }
  );
}
