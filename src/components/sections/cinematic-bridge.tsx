"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CinematicBridge
 *
 * Transition component between Hero and About.
 * 1. Video is preloaded normally (file is small — ~5MB — so no need to
 *    defer loading until scroll-near, which previously caused a load()+play()
 *    race condition that made the video appear to "end" instantly without
 *    ever visibly rendering a frame).
 * 2. Uses IntersectionObserver to trigger PLAYBACK only when scrolled near it
 *    (loading and playing are now decoupled — loading starts on mount,
 *    playing starts on intersect).
 * 3. Section height is a slight ~48vh gap, not a full 100vh wall.
 * 4. Features the premium Space Grotesk NETRONiX logo with red glow.
 */
export function CinematicBridge() {
  const sectionRef     = useRef<HTMLDivElement>(null);
  const videoRef       = useRef<HTMLVideoElement>(null);
  const playedRef      = useRef(false); // permanent, survives re-renders

  const [videoFaded,   setVideoFaded]   = useState(false);
  const [logoVisible,  setLogoVisible]  = useState(false);
  const [overlayIn,    setOverlayIn]    = useState(false);
  const [done,         setDone]         = useState(false);

  // ── Step 3 (defined early so effects below can reference it) ────────────
  const skipToAbout = useCallback(() => {
    setOverlayIn(true);
    setTimeout(() => {
      setDone(true);
      const about = document.getElementById("about");
      if (about) {
        about.scrollIntoView({ behavior: "instant", block: "start" });
      }
      setTimeout(() => setOverlayIn(false), 80);
    }, 900);
  }, []);

  // ── Step 1: Intersection Observer — trigger playback once ───────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Hard safety net: no matter what happens with the video (slow network,
    // stalled buffering, autoplay quirks, etc.) this section must NEVER hold
    // the page hostage for more than a few seconds.
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || playedRef.current) return;

        const video = videoRef.current;

        fallbackTimer = setTimeout(() => {
          if (!playedRef.current) {
            playedRef.current = true;
            skipToAbout();
          }
        }, 3000);

        if (!video) return;

        // Video's src is already set in JSX and has been preloading since
        // mount — just play it. No load()+play() race here.
        video
          .play()
          .then(() => {
            playedRef.current = true;
            if (fallbackTimer) clearTimeout(fallbackTimer);
            setVideoFaded(true);
          })
          .catch(() => {
            playedRef.current = true;
            if (fallbackTimer) clearTimeout(fallbackTimer);
            skipToAbout();
          });

        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "200px 0px 200px 0px" } 
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [skipToAbout]); 

  // ── Step 2: Show logo near the end of the video ────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video?.duration) return;
    if (!logoVisible && video.currentTime / video.duration > 0.72) {
      setLogoVisible(true);
    }
  }, [logoVisible]);

  // Safety net: once the video has started playing, cap the total time
  // we'll wait for it to finish. If it stalls or buffers mid-playback,
  // we still move on rather than blocking scroll.
  useEffect(() => {
    if (!videoFaded) return;
    const maxWaitTimer = setTimeout(() => {
      if (!done) skipToAbout();
    }, 8000);
    return () => clearTimeout(maxWaitTimer);
  }, [videoFaded, done, skipToAbout]);

  const handleEnded = useCallback(() => {
    setTimeout(skipToAbout, 1000);
  }, [skipToAbout]);

  return (
    <>
      <section
        ref={sectionRef}
        id="cinematic-bridge"
        aria-hidden="true"
        className="relative w-full overflow-hidden"
        style={{
          height:     done ? 0 : "48vh",
          minHeight:  done ? 0 : "320px",
          transition: done ? "height 0.01s" : undefined,
          pointerEvents: "none",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#050505", zIndex: 0 }}
        />

        {/* ── Video ─────────────────────────────────────────────────────── */}
        <motion.video
          ref={videoRef}
          src="/assets/videos/hero-signal-logo-transition.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: videoFaded ? 1 : 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {/* ── Top gradient — blends seamlessly from hero's black bottom ── */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: "30%",
            background: "linear-gradient(to bottom, #050505 0%, rgba(5,5,5,0.7) 40%, transparent 100%)",
            zIndex: 2,
          }}
        />

        {/* ── Bottom gradient — fades into About section ─────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "35%",
            background: "linear-gradient(to top, #050505 0%, rgba(5,5,5,0.6) 50%, transparent 100%)",
            zIndex: 2,
          }}
        />

        {/* ── NETRONiX Logo Overlay ──────────────────────────────────── */}
        <AnimatePresence>
          {logoVisible && !done && (
            <motion.div
              key="logo-overlay"
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ 
                zIndex: 10,
                // Premium glassmorphism depth-of-field effect
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                backgroundColor: "rgba(5,5,5,0.45)"
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Wordmark */}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily:    "var(--font-clash-grotesk), sans-serif",
                  fontWeight:    700,
                  fontSize:      "clamp(3.5rem, 12vw, 8rem)",
                  letterSpacing: "0.02em",
                  color:         "#FFFFFF",
                  lineHeight:    1,
                  margin:        0,
                  // Soft, premium crimson glow
                  textShadow:    "0 0 60px rgba(225,29,46,0.3), 0 0 20px rgba(225,29,46,0.5)",
                }}
              >
                NETRONiX
              </motion.h2>

              {/* Red accent underline */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width:           "120px",
                  height:          "2px",
                  backgroundColor: "#E11D2E",
                  marginTop:       "1.5rem",
                  borderRadius:    "9999px",
                  transformOrigin: "center",
                  filter:          "drop-shadow(0 0 6px rgba(225,29,46,0.8))",
                }}
              />

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                style={{
                  fontFamily:    "Inter, sans-serif",
                  fontSize:      "1rem", // slightly larger for readability
                  fontWeight:    500,
                  color:         "rgba(255,255,255,0.9)",
                  marginTop:     "1.5rem",
                  letterSpacing: "0.02em",
                  textShadow:    "0 2px 10px rgba(0,0,0,0.8)", // added drop shadow
                }}
              >
                Powering GIKI's Digital Infrastructure
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Full-page black flash overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {overlayIn && (
          <motion.div
            key="black-overlay"
            className="fixed inset-0 pointer-events-none"
            style={{ backgroundColor: "#050505", zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}