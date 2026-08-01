"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { DURATION, EASE } from "@/lib/motion";
import { SpotlightNavbar } from "@/components/ui/spotlight-navbar";

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "About",     href: "#about" },
  { label: "Events",    href: "#events" },
  { label: "Portal",    href: "#portal" },
  { label: "Community", href: "#community" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollY } = useScroll();

  // Pill shrinks and darkens slightly on scroll
  const pillPadding = useTransform(scrollY, [0, 80], ["0.75rem 1.5rem", "0.5rem 1.25rem"]);
  const pillOpacity  = useTransform(scrollY, [0, 60], [0, 1]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = ["about", "events", "portal", "community"];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ── Desktop Navbar ─────────────────────────────────────────────────── */}
      <motion.nav
        aria-label="Main navigation"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.section, ease: EASE.elegant, delay: 0.2 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-8"
      >
        <SpotlightNavbar
          items={[...NAV_LINKS]}
          className="glass rounded-full"
          leftContent={
            <a
              href="#"
              aria-label="NETRONiX — home"
              className="font-heading font-semibold text-sm tracking-tight text-white shrink-0 hover:opacity-80 transition-opacity"
              style={{ letterSpacing: "-0.02em" }}
            >
              NETRONiX
            </a>
          }
          rightContent={
            <motion.button
              onClick={() => scrollTo("#portal")}
              className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-[250ms] whitespace-nowrap"
              style={{
                backgroundColor: "#E11D2E",
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
              whileHover={{ backgroundColor: "#FF3B4D", scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Report a network issue"
            >
              Report Issue
            </motion.button>
          }
          onItemClick={(item) => scrollTo(item.href)}
        />

        {/* Scroll shadow behind pill */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-full blur-2xl"
          style={{
            opacity: pillOpacity,
            backgroundColor: "rgba(0,0,0,0.6)",
            transform: "scale(1.1)",
          }}
        />
      </motion.nav>

      {/* ── Mobile Navbar ──────────────────────────────────────────────────── */}
      <motion.div
        className="fixed top-4 left-4 right-4 z-50 flex md:hidden items-center justify-between glass rounded-full px-4 py-3"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.section, ease: EASE.elegant, delay: 0.2 }}
      >
        <span
          className="font-heading font-semibold text-sm text-white"
          style={{ letterSpacing: "-0.02em" }}
        >
          NETRONiX
        </span>
        <motion.button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-full text-white/70 hover:text-white transition-colors"
          whileTap={{ scale: 0.9 }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </motion.button>
      </motion.div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/70 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.button }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              className="fixed top-16 left-4 right-4 z-50 glass rounded-2xl p-6 md:hidden"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: DURATION.card, ease: EASE.elegant }}
              role="dialog"
              aria-label="Mobile navigation menu"
            >
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map(({ label, href }) => (
                  <motion.button
                    key={href}
                    onClick={() => scrollTo(href)}
                    className="text-left text-base font-medium text-white/80 hover:text-white py-2 border-b border-white/5 last:border-0 transition-colors"
                    whileHover={{ x: 4 }}
                    transition={{ duration: DURATION.micro }}
                  >
                    {label}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => scrollTo("#portal")}
                  className="mt-2 w-full py-3 rounded-full text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#E11D2E" }}
                  whileHover={{ backgroundColor: "#FF3B4D" }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Report a network issue"
                >
                  Report Issue
                </motion.button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
