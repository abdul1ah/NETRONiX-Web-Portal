import { Nav } from "@/components/ui/nav";
import { Hero } from "@/components/sections/hero";
import { CinematicBridge } from "@/components/sections/cinematic-bridge";
import { About } from "@/components/sections/about";
import { Events } from "@/components/sections/events";
import { ComplaintPortal } from "@/components/sections/complaint-portal";
import { Community } from "@/components/sections/community";
import { Join } from "@/components/sections/join";
import { Footer } from "@/components/sections/footer";

export default function HomePage() {
  return (
    <>
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <Nav />

      {/* ── Main narrative flow ─────────────────────────────────────────── */}
      <main id="main-content">
        {/* 1. Network Awakens */}
        <Hero />

        {/* 2. Cinematic Bridge — Signal travels → NETRONiX logo reveals */}
        <CinematicBridge />

        {/* 3. About — Powering Every Connection */}
        <About />

        {/* 4. Events */}
        <Events />

        {/* 5. Complaint Portal */}
        <ComplaintPortal />

        {/* 6. Community */}
        <Community />

        {/* 7. Join */}
        <Join />
      </main>

      {/* ── Footer — Network Core ────────────────────────────────────────── */}
      <Footer />
    </>
  );
}
