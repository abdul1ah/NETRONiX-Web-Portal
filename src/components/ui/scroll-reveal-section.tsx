"use client";

import { motion } from "framer-motion";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Y distance in pixels the section starts below its natural position */
  distance?: number;
  /** Fraction of the section visible before triggering (default 0.06 = 6%) */
  amount?: number | "some" | "all";
  /** Extra delay in seconds before the animation begins */
  delay?: number;
}

/**
 * ScrollRevealSection
 *
 * Wraps a full page section with a "pulled from beneath" entrance.
 * Uses Framer Motion's whileInView + viewport API — SSR-safe, no
 * useInView hook needed, no hydration flash.
 *
 * - Sections start 60px below at opacity 0
 * - Slide up and fade in with expo-out easing as they enter the viewport
 * - once:true so animation fires only on first entry
 * - Automatically respects prefers-reduced-motion via Framer Motion
 */
export function ScrollRevealSection({
  children,
  className = "",
  distance = 64,
  amount = 0.06,
  delay = 0,
}: ScrollRevealSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1], // expo-out: fast lift, feather-soft landing
      }}
    >
      {children}
    </motion.div>
  );
}
