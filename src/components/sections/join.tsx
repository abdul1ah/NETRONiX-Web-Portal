"use client";

import { SectionWrapper, SectionItem } from "@/components/ui/section-wrapper";
import { motion } from "framer-motion";


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

        {/* ── CTAs ────────────────────────────────────────────────────── */}
        <SectionItem>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Apply — primary */}
            <motion.a
              href="#portal"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold"
              style={{ backgroundColor: "#E11D2E", color: "#FFFFFF" }}
              whileHover={{ backgroundColor: "#FF3B4D", scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
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
            </motion.a>

            {/* Volunteer — ghost */}
            <motion.a
              href="#events"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold border"
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "#FFFFFF",
                backgroundColor: "transparent",
              }}
              whileHover={{ borderColor: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.04)", scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Volunteer for NETRONiX events"
            >
              Volunteer
            </motion.a>
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
