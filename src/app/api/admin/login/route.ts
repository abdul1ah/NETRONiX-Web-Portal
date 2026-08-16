import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/server";
import {
  createSessionToken,
  setSessionCookie,
  isAuthConfigured,
} from "@/lib/auth";

// bcrypt is a Node API — this route must not run on the Edge runtime.
export const runtime = "nodejs";

const LoginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});

/** POST /api/admin/login — username + password → session cookie. */
export async function POST(req: NextRequest) {
  if (!isAdminConfigured() || !isAuthConfigured()) {
    return NextResponse.json(
      {
        message:
          "Admin portal is not configured. Set SUPABASE_SERVICE_ROLE_KEY and ADMIN_SESSION_SECRET in .env.local.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter a username and password" },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;
  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash, display_name")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("[admin login] lookup failed", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // Compare against a dummy hash when the user does not exist, so the response
  // takes the same time either way and cannot be used to enumerate usernames.
  const hash =
    user?.password_hash ??
    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    return NextResponse.json(
      { message: "Incorrect username or password" },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    sub: user.id,
    username: user.username,
    displayName: user.display_name,
  });

  await setSessionCookie(token);

  // Best-effort; a failure here must not block the login.
  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({
    username: user.username,
    displayName: user.display_name,
  });
}
