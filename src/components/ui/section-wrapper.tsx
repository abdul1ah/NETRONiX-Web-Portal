"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariant, staggerContainerVariant, DURATION, EASE } from "@/lib/motion";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Delay before first child starts animating */
  delay?: number;
  /** Stagger interval between children */
  stagger?: number;
  /** Threshold — how much of the element must be visible before triggering */
  threshold?: number;
}

/**
 * Reusable scroll-triggered reveal wrapper.
 * Wraps section content in a staggered fade-up animation.
 * Respects prefers-reduced-motion automatically via Framer Motion.
 */
export function SectionWrapper({
  children,
  className = "",
  id,
  delay = 0,
  stagger = 0.12,
  threshold = 0.15,
}: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      variants={staggerContainerVariant(stagger)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual animated item inside a SectionWrapper.
 * Fades up with a slight vertical offset.
 */
export function SectionItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUpVariant} className={className}>
      {children}
    </motion.div>
  );
}
