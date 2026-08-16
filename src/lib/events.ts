/**
 * Event domain logic — shared by the website, the registration form,
 * the API routes and the admin portal.
 *
 * The status rules here mirror `event_effective_status()` in
 * supabase/schema.sql. Keep the two in step.
 */

import type { EventRow, EventStatus } from "@/lib/supabase/types";

/** How the site labels each status. */
export const STATUS_LABEL: Record<EventStatus, string> = {
  live:        "Live Now",
  coming_soon: "Coming Soon",
  past:        "Concluded",
};

/**
 * Resolve the status actually shown to visitors.
 *
 * Precedence, matching the SQL function:
 *   1. auto_close_at has passed  → past
 *   2. manual status is past     → past
 *   3. auto_live_at has passed   → live
 *   4. otherwise                 → the manual status
 *
 * `now` is injectable so this stays testable and so server and client can be
 * given the same instant.
 */
export function effectiveStatus(
  event: Pick<EventRow, "status" | "auto_live_at" | "auto_close_at">,
  now: Date = new Date()
): EventStatus {
  const close = event.auto_close_at ? new Date(event.auto_close_at) : null;
  if (close && now >= close) return "past";

  if (event.status === "past") return "past";

  const live = event.auto_live_at ? new Date(event.auto_live_at) : null;
  if (live && now >= live) return "live";

  return event.status;
}

/** Can someone submit the registration form for this event right now? */
export function isRegistrationOpen(
  event: Pick<
    EventRow,
    "status" | "auto_live_at" | "auto_close_at" | "registration_open"
  >,
  now: Date = new Date()
): boolean {
  return event.registration_open && effectiveStatus(event, now) === "live";
}

/** Where the event card's button points. */
export function registrationHref(slug: string): string {
  return `/events/${slug}/register`;
}

// ─── Skills catalogue ────────────────────────────────────────────────────────
// The checkbox options on every registration form. Values are stored verbatim
// in registrations.skills, so change `value` only if you are willing to
// migrate existing rows — change `label` freely.

export interface SkillOption {
  value: string;
  label: string;
  group: string;
}

export const SKILL_OPTIONS: SkillOption[] = [
  // Technical
  { value: "networking",       label: "Networking / CCNA",        group: "Technical" },
  { value: "web-dev",          label: "Web Development",          group: "Technical" },
  { value: "app-dev",          label: "App Development",          group: "Technical" },
  { value: "programming",      label: "Programming (C++/Python)", group: "Technical" },
  { value: "hardware",         label: "Hardware / Electronics",   group: "Technical" },
  { value: "cybersecurity",    label: "Cybersecurity",            group: "Technical" },
  { value: "ai-ml",            label: "AI / Machine Learning",    group: "Technical" },
  { value: "game-dev",         label: "Game Development",         group: "Technical" },

  // Creative
  { value: "graphic-design",   label: "Graphic Design",           group: "Creative" },
  { value: "video-editing",    label: "Video Editing",            group: "Creative" },
  { value: "photography",      label: "Photography",              group: "Creative" },
  { value: "ui-ux",            label: "UI / UX Design",           group: "Creative" },
  { value: "content-writing",  label: "Content Writing",          group: "Creative" },

  // Operations
  { value: "event-management", label: "Event Management",         group: "Operations" },
  { value: "marketing",        label: "Marketing / Social Media", group: "Operations" },
  { value: "sponsorships",     label: "Sponsorships / Outreach",  group: "Operations" },
  { value: "logistics",        label: "Logistics",                group: "Operations" },
  { value: "public-speaking",  label: "Public Speaking / Hosting",group: "Operations" },

  // Escape hatch — pairs with the free-text `other_skill` column
  { value: "other",            label: "Other (tell us below)",    group: "Operations" },
];

export const SKILL_VALUES = SKILL_OPTIONS.map((s) => s.value);

/** Grouped for rendering, in a stable order. */
export const SKILL_GROUPS = ["Technical", "Creative", "Operations"] as const;

/** Turn a stored value back into its label, for the admin table. */
export function skillLabel(value: string): string {
  return SKILL_OPTIONS.find((s) => s.value === value)?.label ?? value;
}

// ─── Batches ─────────────────────────────────────────────────────────────────
// GIKI batches 36 down to 33, newest first — matches how students read them.

export const BATCH_OPTIONS = [36, 35, 34, 33] as const;
