"use client";

import { SectionWrapper, SectionItem } from "@/components/ui/section-wrapper";

export function Join() {
  return (
    <section
      id="join"
      aria-labelledby="join-heading"
      className="section-padding px-4 md:px-8 max-w-7xl mx-auto w-full"
    >
      <SectionWrapper
        className="flex flex-col items-center text-center gap-12"
        delay={0.05}
        threshold={0.3}
      >
        {/* ── Heading ────────────────────────────────────────────────────── */}
        <SectionItem className="max-w-3xl">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-6"
            style={{ color: "#E11D2E", letterSpacing: "0.12em" }}
          >
            Open Positions
          </p>
          <h2
            id="join-heading"
            className="font-heading font-semibold text-balance"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            Join the Team Behind GIKI's
            <br />
            <span style={{ color: "#E11D2E" }}>Digital Infrastructure</span>
          </h2>
        </SectionItem>

        {/* ── CTAs ──────────────────────────────────────────────────────── */}
        <SectionItem>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Apply — primary */}
            <a
              href="#"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold transition-all duration-[250ms]"
              style={{ backgroundColor: "#E11D2E", color: "#FFFFFF" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#FF3B4D";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#E11D2E";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
              aria-label="Apply to join NETRONiX"
            >
              Apply Now
              <svg
                className="w-4 h-4 transition-transform duration-[250ms] group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Volunteer — ghost */}
            <a
              href="#"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold border transition-all duration-[250ms]"
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "#FFFFFF",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
              aria-label="Volunteer for NETRONiX events"
            >
              Volunteer
            </a>
          </div>
        </SectionItem>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <SectionItem className="w-full max-w-xs">
          <div
            className="w-full h-px rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            aria-hidden="true"
          />
        </SectionItem>

      </SectionWrapper>
    </section>
  );
}
