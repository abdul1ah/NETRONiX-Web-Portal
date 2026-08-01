"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Y distance in pixels the section starts below its natural position */
  distance?: number;
  /** Fraction of the section that must be visible to trigger */
  threshold?: number;
  /** Extra delay in seconds before the animation begins */
  delay?: number;
}

/**
 * ScrollRevealSection
 *
 * Wraps a full page section in a smooth "pulled from beneath" entrance.
 * The section starts slightly below its natural position and at opacity 0,
 * then slides up and fades in as soon as it enters the viewport.
 *
 * Applied to every section from Events downward so the page feels alive
 * and cinematic while scrolling.
 *
 * - Uses Framer Motion's useInView with `once: true` so the animation
 *   only fires once per session (no re-trigger on scroll-back).
 * - Automatically respects `prefers-reduced-motion` via Framer Motion.
 */
export function ScrollRevealSection({
  children,
  className = "",
  distance = 60,
  threshold = 0.08,
  delay = 0,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: distance }
      }
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1], // expo-out — fast rise, soft landing
      }}
    >
      {children}
    </motion.div>
  );
}
