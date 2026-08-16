/**
 * Supabase — browser / anon client.
 *
 * Uses the public anon key, which is gated by Row Level Security:
 * it can read events and insert a registration into a live event, nothing else.
 * Safe to import from Client Components.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase env vars are present. Lets the site render before setup. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export function createBrowserClient() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example)."
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
