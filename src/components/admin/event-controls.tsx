"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EventRow, EventStatus } from "@/lib/supabase/types";
import { STATUS_LABEL, registrationHref } from "@/lib/events";

const STATUS_COLOR: Record<EventStatus, string> = {
  live:        "#E11D2E",
  coming_soon: "#FFFFFF",
  past:        "#666666",
};

/**
 * Convert a datetime-local input value ("2026-09-01T18:00") into an ISO string
 * with an offset, which is what the API's date validator expects.
 * Interpreted in the admin's own timezone, which is what they mean by "6pm".
 */
function localInputToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** The reverse, for populating the input from a stored timestamp. */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

interface EventControlsProps {
  event: EventRow;
  /** Status after the schedule is applied. Computed on the server, so the
   *  clock is never read during render. */
  shown: EventStatus;
  submissionCount: number;
  onViewSubmissions: () => void;
}

export function EventControls({
  event,
  shown,
  submissionCount,
  onViewSubmissions,
}: EventControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [liveAt, setLiveAt]   = useState(isoToLocalInput(event.auto_live_at));
  const [closeAt, setCloseAt] = useState(isoToLocalInput(event.auto_close_at));

  const scheduled =
    shown !== event.status
      ? "Currently overridden by the schedule below."
      : null;

  async function save(changes: Record<string, unknown>) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.message ?? "Could not save.");
        return;
      }

      setSaved(true);
      startTransition(() => router.refresh());
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || pending;

  return (
    <article
      className="rounded-2xl border p-5 md:p-6 flex flex-col gap-5"
      style={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* ── Title row ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-heading font-semibold text-lg">{event.title}</h3>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                color: STATUS_COLOR[shown],
                backgroundColor:
                  shown === "live"
                    ? "rgba(225,29,46,0.15)"
                    : "rgba(255,255,255,0.06)",
              }}
            >
              {shown === "live" && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#E11D2E" }}
                />
              )}
              {STATUS_LABEL[shown]}
            </span>
          </div>

          <p className="font-mono text-xs" style={{ color: "#666666" }}>
            /{event.slug} · {submissionCount} submissions
            {scheduled && ` · ${scheduled}`}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewSubmissions}
            className="py-2 px-4 rounded-lg text-sm font-medium border transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "#B3B3B3" }}
          >
            View submissions
          </button>

          {shown === "live" && (
            <a
              href={registrationHref(event.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: "rgba(225,29,46,0.4)", color: "#FFFFFF" }}
            >
              Open form ↗
            </a>
          )}
        </div>
      </div>

      {/* ── Status switch ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "#B3B3B3", letterSpacing: "0.12em" }}
        >
          Status
        </p>

        <div className="flex flex-wrap gap-2">
          {(["coming_soon", "live", "past"] as const).map((value) => {
            const active = event.status === value;
            return (
              <button
                key={value}
                disabled={busy}
                onClick={() => save({ status: value })}
                className="py-2 px-4 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: active
                    ? "rgba(225,29,46,0.15)"
                    : "transparent",
                  borderColor: active
                    ? "rgba(225,29,46,0.5)"
                    : "rgba(255,255,255,0.12)",
                  color: active ? "#FFFFFF" : "#666666",
                }}
              >
                {STATUS_LABEL[value]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Registration toggle ────────────────────────────────────────── */}
      <label className="flex items-center gap-3 text-sm cursor-pointer w-fit">
        <input
          type="checkbox"
          className="accent-[#E11D2E] w-4 h-4"
          checked={event.registration_open}
          disabled={busy}
          onChange={(e) => save({ registration_open: e.target.checked })}
        />
        <span style={{ color: "#B3B3B3" }}>
          Accept new registrations
          <span style={{ color: "#666666" }}>
            {" "}
            — untick to freeze the form without changing the status
          </span>
        </span>
      </label>

      {/* ── Schedule ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "#B3B3B3", letterSpacing: "0.12em" }}
        >
          Schedule (optional)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`live-${event.id}`}
              className="text-xs"
              style={{ color: "#666666" }}
            >
              Goes live at
            </label>
            <input
              id={`live-${event.id}`}
              type="datetime-local"
              value={liveAt}
              disabled={busy}
              onChange={(e) => setLiveAt(e.target.value)}
              onBlur={() => {
                const iso = localInputToIso(liveAt);
                if (iso !== event.auto_live_at) save({ auto_live_at: iso });
              }}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "#0F0F0F",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#FFFFFF",
                colorScheme: "dark",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`close-${event.id}`}
              className="text-xs"
              style={{ color: "#666666" }}
            >
              Closes at
            </label>
            <input
              id={`close-${event.id}`}
              type="datetime-local"
              value={closeAt}
              disabled={busy}
              onChange={(e) => setCloseAt(e.target.value)}
              onBlur={() => {
                const iso = localInputToIso(closeAt);
                if (iso !== event.auto_close_at) save({ auto_close_at: iso });
              }}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "#0F0F0F",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#FFFFFF",
                colorScheme: "dark",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Feedback ───────────────────────────────────────────────────── */}
      {error && (
        <p role="alert" className="text-xs" style={{ color: "#E11D2E" }}>
          {error}
        </p>
      )}
      {!error && saved && (
        <p className="text-xs" style={{ color: "#666666" }}>
          {busy ? "Saving..." : "Saved."}
        </p>
      )}
    </article>
  );
}
