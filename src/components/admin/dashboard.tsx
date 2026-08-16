"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSession } from "@/lib/auth";
import type { EventRow, EventStatus } from "@/lib/supabase/types";
import { EventControls } from "./event-controls";
import { SubmissionsTable } from "./submissions-table";

interface AdminDashboardProps {
  session: AdminSession;
  events: EventRow[];
  counts: Record<string, number>;
  /** Effective status per event id, resolved on the server. */
  statuses: Record<string, EventStatus>;
}

type Tab = "events" | "submissions";

export function AdminDashboard({
  session,
  events,
  counts,
  statuses,
}: AdminDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("events");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events[0]?.id ?? null
  );

  const totalSubmissions = Object.values(counts).reduce((a, b) => a + b, 0);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  /** Jump straight from an event card to that event's submissions. */
  function viewSubmissions(eventId: string) {
    setSelectedEventId(eventId);
    setTab("submissions");
  }

  return (
    <main
      className="min-h-screen w-full px-4 md:px-8 py-10"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "#E11D2E", letterSpacing: "0.12em" }}
            >
              NETRONiX Admin
            </p>
            <h1
              className="font-heading font-semibold"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}
            >
              Portal
            </h1>
            <p className="text-sm" style={{ color: "#666666" }}>
              Signed in as {session.displayName ?? session.username} ·{" "}
              {events.length} events · {totalSubmissions} submissions
            </p>
          </div>

          <button
            onClick={logout}
            className="py-2.5 px-5 rounded-lg text-sm font-medium border transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "#B3B3B3" }}
          >
            Sign out
          </button>
        </header>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div
          className="flex gap-1 p-1 rounded-xl border w-fit"
          style={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {([
            ["events", "Events"],
            ["submissions", "Submissions"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className="py-2 px-5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  tab === value ? "rgba(225,29,46,0.15)" : "transparent",
                color: tab === value ? "#FFFFFF" : "#666666",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Events tab ───────────────────────────────────────────────── */}
        {tab === "events" && (
          <section className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: "#666666" }}>
              Tick an event live and its card on the website turns into a
              working Register button. Set a go-live date instead and it flips
              on its own at that moment.
            </p>

            {events.length === 0 ? (
              <div
                className="rounded-2xl border p-8 text-sm"
                style={{
                  backgroundColor: "#141414",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "#B3B3B3",
                }}
              >
                No events yet. Run <code>supabase/schema.sql</code> in the
                Supabase SQL editor to create and seed them.
              </div>
            ) : (
              events.map((event) => (
                <EventControls
                  key={event.id}
                  event={event}
                  shown={statuses[event.id] ?? event.status}
                  submissionCount={counts[event.id] ?? 0}
                  onViewSubmissions={() => viewSubmissions(event.id)}
                />
              ))
            )}
          </section>
        )}

        {/* ── Submissions tab ──────────────────────────────────────────── */}
        {tab === "submissions" && (
          <section className="flex flex-col gap-5">
            {/* Event picker — submissions are always scoped to exactly one
                event, so there is never any doubt whose rows these are. */}
            <div className="flex flex-wrap gap-2">
              {events.map((event) => {
                const active = event.id === selectedEventId;
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className="py-2 px-4 rounded-lg text-sm font-medium border transition-colors"
                    style={{
                      backgroundColor: active
                        ? "rgba(225,29,46,0.15)"
                        : "#141414",
                      borderColor: active
                        ? "rgba(225,29,46,0.5)"
                        : "rgba(255,255,255,0.08)",
                      color: active ? "#FFFFFF" : "#B3B3B3",
                    }}
                  >
                    {event.title}
                    <span className="ml-2" style={{ color: "#666666" }}>
                      {counts[event.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedEventId ? (
              <SubmissionsTable
                key={selectedEventId}
                eventId={selectedEventId}
                eventTitle={
                  events.find((e) => e.id === selectedEventId)?.title ?? "Event"
                }
              />
            ) : (
              <p className="text-sm" style={{ color: "#666666" }}>
                Select an event to see its submissions.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
