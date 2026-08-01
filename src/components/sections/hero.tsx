"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroRevealVariant, staggerContainerVariant, DURATION, EASE } from "@/lib/motion";

export function Hero() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    // Show the scroll indicator regardless of whether the video plays,
    // fails to load, or autoplay is blocked — never let it hinge on
    // video playback succeeding.
    setVideoReady(true);

    if (!video) return;

    // Safari requires direct play() call
    video.play().catch(() => {
      // Autoplay blocked — content is still shown via setVideoReady above
    });
  }, []);

  // Scroll indicator click → smooth scroll to next section
  const scrollDown = () => {
    const next = document.getElementById("cinematic-bridge") ?? document.getElementById("about");
    next?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-[600px] overflow-hidden flex items-center justify-center"
      aria-label="Hero — NETRONiX Network Awakens"
    >
      {/* ── Background Video ────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src="/assets/videos/hero-network-awakens.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />



      {/* ── Gradient Overlay — top darkens video slightly, bottom fades to pure black ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0.05) 30%, rgba(5,5,5,0.0) 50%, rgba(5,5,5,0.5) 70%, rgba(5,5,5,0.9) 88%, #050505 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Hero Content ─────────────────────────────────────────────────── */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto"
            variants={staggerContainerVariant(0.15)}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.3 }}
          >


            {/* Main heading */}
            <motion.h1
              variants={heroRevealVariant}
              className="font-heading font-semibold mb-6 text-balance"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
              }}
            >
              Powering GIKI's{" "}
              <span style={{ color: "#E11D2E" }}>Digital</span>{" "}
              Infrastructure
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={heroRevealVariant}
              className="max-w-xl text-base md:text-lg leading-relaxed mb-10"
              style={{ color: "#B3B3B3" }}
            >
              Maintaining one of Pakistan's largest student-managed campus
              networks while creating unforgettable technical and gaming
              experiences.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={heroRevealVariant}
              className="flex flex-col sm:flex-row gap-3 items-center"
            >
              <motion.a
                href="#events"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#050505",
                  letterSpacing: "-0.01em",
                }}
                whileHover={{ backgroundColor: "#E5E5E5", scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Explore NETRONiX events"
              >
                Explore Events
              </motion.a>

              <motion.a
                href="#portal"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "#E11D2E",
                  color: "#FFFFFF",
                }}
                whileHover={{
                  backgroundColor: "#FF3B4D",
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.97 }}
                aria-label="Report a network issue"
              >
                Report Network Issue
              </motion.a>
            </motion.div>
          </motion.div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <motion.button
        type="button"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer"
        initial={{ opacity: 0, y: 8 }}
        animate={videoReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ delay: 1.2, duration: DURATION.section, ease: EASE.elegant }}
        onClick={scrollDown}
        aria-label="Scroll down to explore"
      >
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
          Scroll
        </span>
        <motion.div
          className="w-px h-8 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          animate={{ scaleY: [1, 0.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      </motion.button>
    </section>
  );
}