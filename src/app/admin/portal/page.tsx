import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/dashboard";
import type { EventRow } from "@/lib/supabase/types";
import { effectiveStatus } from "@/lib/events";

export const metadata: Metadata = {
  title: "Portal — NETRONiX Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  // proxy.ts already gated this route; this is the server-side belt-and-braces.
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/admin/portal");

  if (!isAdminConfigured()) {
    return (
      <main
        className="min-h-screen w-full flex items-center justify-center px-4"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div
          className="max-w-md rounded-2xl border p-8 flex flex-col gap-3"
          style={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h1 className="font-heading font-semibold text-xl">
            Supabase is not connected
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#B3B3B3" }}>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>,
            then restart the dev server. See <code>.env.example</code>.
          </p>
        </div>
      </main>
    );
  }

  const supabase = createAdminClient();

  const [{ data: events }, { data: counts }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("registrations").select("event_id"),
  ]);

  // Roll the submission counts up per event in one pass.
  const countByEvent = new Map<string, number>();
  for (const row of counts ?? []) {
    countByEvent.set(row.event_id, (countByEvent.get(row.event_id) ?? 0) + 1);
  }

  const eventRows = (events ?? []) as EventRow[];

  // Resolve each event's status here, against the server clock, so the client
  // components stay pure and server and client cannot disagree.
  const now = new Date();
  const statuses = Object.fromEntries(
    eventRows.map((event) => [event.id, effectiveStatus(event, now)])
  );

  return (
    <AdminDashboard
      session={session}
      events={eventRows}
      counts={Object.fromEntries(countByEvent)}
      statuses={statuses}
    />
  );
}
