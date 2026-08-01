"use client";

import { motion } from "framer-motion";
import { scaleInVariant, DURATION } from "@/lib/motion";
import Image from "next/image";

export type EventStatus = "live" | "upcoming" | "past";

interface EventCardProps {
  title: string;
  subtitle?: string;
  description: string;
  status: EventStatus;
  registerHref?: string;
  /** Optional aspect ratio class, defaults to "aspect-video" */
  aspectClass?: string;
  /** Placeholder color for the image area */
  accentColor?: string;
  /** Icon or short label shown in image placeholder */
  imagePlaceholder?: string;
  /** Image source path to display */
  imageSrc?: string;
}

const STATUS_CONFIG = {
  live:     { label: "Live Now",  color: "#E11D2E", bg: "rgba(225,29,46,0.15)"  },
  upcoming: { label: "Upcoming",  color: "#FFFFFF", bg: "rgba(255,255,255,0.08)" },
  past:     { label: "Concluded", color: "#666666", bg: "rgba(255,255,255,0.05)" },
} as const;

export function EventCard({
  title,
  subtitle,
  description,
  status,
  registerHref = "#",
  aspectClass = "aspect-video",
  accentColor = "#1A1A1A",
  imagePlaceholder,
  imageSrc,
}: EventCardProps) {
  const statusCfg = STATUS_CONFIG[status];

  return (
    <motion.article
      variants={scaleInVariant}
      className="group relative flex flex-col rounded-2xl overflow-hidden border hover-red-glow"
      style={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.08)" }}
      whileHover={{ y: -6, transition: { duration: DURATION.card, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* ── Image / Placeholder ──────────────────────────────────────────── */}
      <div
        className={`relative ${aspectClass} overflow-hidden flex items-center justify-center`}
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : imagePlaceholder ? (
          <span
            className="font-heading font-bold tracking-tight select-none pointer-events-none z-10"
            style={{
              fontSize: "clamp(1.5rem, 5vw, 3rem)",
              color: "rgba(255,255,255,0.12)",
              letterSpacing: "-0.03em",
            }}
          >
            {imagePlaceholder}
          </span>
        ) : null}

        {/* Gradient fade at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{ background: `linear-gradient(to top, ${accentColor}, transparent)` }}
        />
      </div>

      {/* Status badge — outside aria-hidden so screen readers announce it */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
        >
          {status === "live" && (
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-red"
              style={{ backgroundColor: "#E11D2E" }}
              aria-hidden="true"
            />
          )}
          {statusCfg.label}
        </span>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 gap-3 p-5">
        {subtitle && (
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "#E11D2E", letterSpacing: "0.12em" }}
          >
            {subtitle}
          </p>
        )}
        <h3
          className="font-heading font-semibold text-lg leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: "#B3B3B3" }}>
          {description}
        </p>

        {/* Register button — only shown when a real href exists */}
        {registerHref && registerHref !== "#" ? (
          <motion.a
            href={registerHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition-all duration-[250ms]"
            style={{
              borderColor: status === "past" ? "rgba(255,255,255,0.08)" : "rgba(225,29,46,0.4)",
              color: status === "past" ? "#666666" : "#FFFFFF",
              pointerEvents: status === "past" ? "none" : "auto",
            }}
            whileHover={
              status !== "past"
                ? { backgroundColor: "rgba(225,29,46,0.12)", borderColor: "rgba(225,29,46,0.7)" }
                : {}
            }
            whileTap={status !== "past" ? { scale: 0.98 } : {}}
            aria-disabled={status === "past"}
            aria-label={status === "past" ? `${title} — concluded` : `Register for ${title}`}
          >
            {status === "past" ? "Concluded" : "Register →"}
          </motion.a>
        ) : status === "past" ? (
          <div
            className="mt-2 w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center"
            style={{ color: "#666666", backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            Concluded
          </div>
        ) : (
          <div
            className="mt-2 w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center border"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "#666666" }}
            title="Registration link coming soon"
          >
            Coming Soon
          </div>
        )}
      </div>
    </motion.article>
  );
}
