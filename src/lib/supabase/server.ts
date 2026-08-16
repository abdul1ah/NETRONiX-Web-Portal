import "server-only";

/**
 * Supabase — server-side clients.
 *
 * `createAdminClient()` uses the service_role key and bypasses Row Level
 * Security entirely. It must never be imported into a Client Component; the
 * "server-only" import above turns that mistake into a build error.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Read at call time, not module load, so the checks work in every runtime.
const url        = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey    = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the server has everything it needs to reach Supabase. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url() && anonKey());
}

/** True when the admin portal can operate (needs the service_role key). */
export function isAdminConfigured(): boolean {
  return Boolean(url() && serviceKey());
}

/**
 * Full-access client for the admin portal and trusted API routes.
 * Bypasses RLS — only ever call this from server code behind an auth check.
 */
export function createAdminClient() {
  const projectUrl = url();
  const key        = serviceKey();

  if (!projectUrl || !key) {
    throw new Error(
      "Admin Supabase client unavailable. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example)."
    );
  }

  return createClient<Database>(projectUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Read-only client using the anon key, for server rendering public pages.
 * Still subject to RLS, so it can only ever see public data.
 */
export function createPublicServerClient() {
  const projectUrl = url();
  const key        = anonKey();

  if (!projectUrl || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example)."
    );
  }

  return createClient<Database>(projectUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
