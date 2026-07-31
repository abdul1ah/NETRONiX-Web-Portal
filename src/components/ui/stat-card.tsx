"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { scaleInVariant } from "@/lib/motion";

interface StatCardProps {
  value: number;
  suffix?: string;
  label: string;
  /** Delay before counter starts (ms) */
  delay?: number;
}

// ─── Counter Hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!started) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, started]);

  return count;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatCard({ value, suffix = "", label, delay = 0 }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (isInView && !started) {
      const timer = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, started, delay]);

  const count = useCountUp(value, 1800, started);

  return (
    <motion.div
      ref={ref}
      variants={scaleInVariant}
      className="group relative flex flex-col gap-2 p-6 rounded-xl border transition-all duration-[400ms] cursor-default"
      style={{
        backgroundColor: "#141414",
        borderColor: "rgba(255,255,255,0.08)",
      }}
      whileHover={{
        y: -4,
        borderColor: "rgba(255,255,255,0.16)",
        backgroundColor: "#1A1A1A",
        transition: { duration: 0.25 },
      }}
    >
      {/* Number */}
      <div
        className="font-mono text-4xl md:text-5xl font-medium tracking-tight text-white leading-none"
        aria-label={`${value}${suffix} ${label}`}
      >
        <span aria-hidden="true">{count}</span>
        <span
          aria-hidden="true"
          className="text-3xl md:text-4xl"
          style={{ color: "#E11D2E" }}
        >
          {suffix}
        </span>
      </div>

      {/* Label */}
      <p
        className="text-sm font-medium tracking-wide uppercase"
        style={{ color: "#B3B3B3", letterSpacing: "0.08em" }}
      >
        {label}
      </p>

      {/* Subtle accent line at bottom */}
      <motion.div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full"
        style={{ backgroundColor: "#E11D2E", scaleX: 0, originX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay: delay / 1000 + 0.3, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
