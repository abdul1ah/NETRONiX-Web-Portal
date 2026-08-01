import { Nav } from "@/components/ui/nav";
import { Hero } from "@/components/sections/hero";
import { CinematicBridge } from "@/components/sections/cinematic-bridge";
import { About } from "@/components/sections/about";
import { Events } from "@/components/sections/events";
import { ComplaintPortal } from "@/components/sections/complaint-portal";
import { Community } from "@/components/sections/community";
import { Join } from "@/components/sections/join";
import { Footer } from "@/components/sections/footer";
import { ScrollRevealSection } from "@/components/ui/scroll-reveal-section";

export default function HomePage() {
  return (
    <>
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <Nav />

      {/* ── Main narrative flow ─────────────────────────────────────────── */}
      <main id="main-content">
        {/* 1. Network Awakens — no reveal wrapper (it's the entry point) */}
        <Hero />

        {/* 2. Cinematic Bridge — Signal travels → NETRONiX logo reveals */}
        <CinematicBridge />

        {/* 3. About — subtle reveal, threshold higher so it fires earlier */}
        <ScrollRevealSection threshold={0.05} distance={50}>
          <About />
        </ScrollRevealSection>

        {/* 4. Events */}
        <ScrollRevealSection threshold={0.06} distance={60}>
          <Events />
        </ScrollRevealSection>

        {/* 5. Complaint Portal */}
        <ScrollRevealSection threshold={0.06} distance={60}>
          <ComplaintPortal />
        </ScrollRevealSection>

        {/* 6. Community */}
        <ScrollRevealSection threshold={0.06} distance={60}>
          <Community />
        </ScrollRevealSection>

        {/* 7. Join */}
        <ScrollRevealSection threshold={0.08} distance={50}>
          <Join />
        </ScrollRevealSection>
      </main>

      {/* ── Footer — Network Core ────────────────────────────────────────── */}
      <ScrollRevealSection threshold={0.04} distance={40}>
        <Footer />
      </ScrollRevealSection>
    </>
  );
}
