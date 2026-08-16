import "server-only";

/**
 * Server-side event fetching for the public website.
 *
 * If Supabase is not configured yet, or is unreachable, the site falls back to
 * the seeded list below so the homepage never breaks. The fallback mirrors the
 * seed data in supabase/schema.sql.
 */

import { createAdminClient, isAdminConfigured } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/supabase/types";

const FALLBACK_EVENTS: EventRow[] = [
  {
    id: "fallback-ugx",
    slug: "ugx",
    title: "UGX — Uber.Game X",
    subtitle: "Annual Gaming Event",
    description:
      "Pakistan's largest university gaming tournament. Featuring CS:GO, FIFA, Valorant, and more across two unforgettable days at GIKI.",
    image_src: "/events/UGX_v2.jpeg",
    image_placeholder: "UGX",
    accent_color: "#0D0D12",
    status: "coming_soon",
    auto_live_at: null,
    auto_close_at: null,
    registration_open: true,
    max_registrations: null,
    form_intro: null,
    is_featured: true,
    sort_order: 10,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-hnc",
    slug: "hack-n-connect",
    title: "Hack n Connect",
    subtitle: "Hackathon",
    description:
      "A 24-hour hackathon challenging students to build innovative solutions to real-world networking and infrastructure problems.",
    image_src: "/events/HNC_v2.jpeg",
    image_placeholder: "H&C",
    accent_color: "#0D120D",
    status: "coming_soon",
    auto_live_at: null,
    auto_close_at: null,
    registration_open: true,
    max_registrations: null,
    form_intro: null,
    is_featured: false,
    sort_order: 20,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-inductions",
    slug: "inductions",
    title: "Inductions",
    subtitle: "Society Recruitment",
    description:
      "Join NETRONiX. Open inductions for engineers, developers, event coordinators, and creative minds.",
    image_src: "/events/Inductions.jpeg",
    image_placeholder: "IND",
    accent_color: "#120D0D",
    status: "coming_soon",
    auto_live_at: null,
    auto_close_at: null,
    registration_open: true,
    max_registrations: null,
    form_intro: null,
    is_featured: false,
    sort_order: 30,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-volunteer",
    slug: "volunteer-call",
    title: "Volunteer Call",
    subtitle: "Open Call",
    description:
      "Help us run the largest events at GIKI. Volunteer for UGX, Hack n Connect, and SNP as crew, logistics, or tech support.",
    image_src: "/events/Volcall.jpeg",
    image_placeholder: "VOL",
    accent_color: "#0D0D0D",
    status: "coming_soon",
    auto_live_at: null,
    auto_close_at: null,
    registration_open: true,
    max_registrations: null,
    form_intro: null,
    is_featured: false,
    sort_order: 40,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-snp",
    slug: "snp",
    title: "SNP",
    subtitle: "Society Night & Party",
    description:
      "NETRONiX's annual celebration. Live performances, food, and the entire GIKI community together under one roof.",
    image_src: "/events/SNP.jpeg",
    image_placeholder: "SNP",
    accent_color: "#0A0A0A",
    status: "past",
    auto_live_at: null,
    auto_close_at: null,
    registration_open: false,
    max_registrations: null,
    form_intro: null,
    is_featured: false,
    sort_order: 50,
    created_at: "",
    updated_at: "",
  },
];

export async function getPublicEvents(): Promise<EventRow[]> {
  if (!isAdminConfigured()) return FALLBACK_EVENTS;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[events] fetch failed, using fallback", error);
      return FALLBACK_EVENTS;
    }

    return data && data.length > 0 ? (data as EventRow[]) : FALLBACK_EVENTS;
  } catch (err) {
    console.error("[events] fetch threw, using fallback", err);
    return FALLBACK_EVENTS;
  }
}
