"use client";

import { SectionWrapper, SectionItem } from "@/components/ui/section-wrapper";
import TextAnimation from "@/components/ui/staggerText";
import { CylinderCarousel } from "@/components/ui/cylinder-carousel";
import { motion } from "framer-motion";
import Image from "next/image";

// Each cell in the asymmetric grid
interface GalleryCell {
  label:       string;
  color:       string;  // background color
  accent:      string;  // text accent color
  gridArea:    string;
  description: string;
  imageSrc?:   string;
}

const GALLERY: GalleryCell[] = [
  {
    label:    "Concerts",
    color:    "#0A0A0C",
    accent:   "#E11D2E",
    gridArea: "concert",
    description: "Live performances, bands, and unforgettable nights",
    imageSrc: "/community/Concert.jpeg",
  },
  {
    label:    "Hackathons",
    color:    "#0A0C0A",
    accent:   "#FFFFFF",
    gridArea: "hack",
    description: "24-hour builds, late nights, and breakthrough ideas",
    imageSrc: "/community/Hackathon.jpg",
  },
  {
    label:    "Gaming",
    color:    "#0C0A0A",
    accent:   "#E11D2E",
    gridArea: "gaming",
    description: "Competitive esports at UGX — Pakistan's biggest student tournament",
    imageSrc: "/community/Gaming.jpeg",
  },
  {
    label:    "Networking",
    color:    "#0A0A0A",
    accent:   "#FFFFFF",
    gridArea: "networking",
    description: "Industry talks, alumni connections, and career pathways",
    imageSrc: "/community/Networking.jpg",
  },
  {
    label:    "Volunteers",
    color:    "#0D0A0A",
    accent:   "#B3B3B3",
    gridArea: "volunteers",
    description: "The people who make it all possible",
    imageSrc: "/community/Volunteers.jpeg",
  },
];

export function Community() {
  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      className="section-padding px-4 md:px-8 max-w-7xl mx-auto w-full"
    >
      <SectionWrapper className="flex flex-col gap-12" delay={0.05}>

        {/* ── Heading ────────────────────────────────────────────────────── */}
        <SectionItem>
          <p
            className="font-mono text-xs uppercase tracking-widest mb-4"
            style={{ color: "#E11D2E", letterSpacing: "0.12em" }}
          >
            The Community
          </p>
          <h2
            id="community-heading"
            className="font-heading font-semibold max-w-xl"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            <TextAnimation delay={0.1}>Built by Students.</TextAnimation>
            <br />
            <TextAnimation delay={0.3}>For Everyone.</TextAnimation>
          </h2>
        </SectionItem>

        {/* ── Cylinder Carousel ───────────────────────────────────────────── */}
        <SectionItem className="mt-12">
          <CylinderCarousel
            animationDuration={40} // Nice and slow
            cardWidth="clamp(300px, 45vw, 600px)"
            aspectRatio="4/3"
            items={GALLERY.map((cell) => (
              <div key={cell.label} className="w-full h-full">
                <CommunityCell cell={cell} />
              </div>
            ))}
          />
        </SectionItem>

      </SectionWrapper>
    </section>
  );
}

// ─── Individual Cell ──────────────────────────────────────────────────────────

function CommunityCell({ cell }: { cell: GalleryCell }) {
  return (
    <div
      className="group relative w-full h-full rounded-2xl overflow-hidden cursor-default transition-all duration-[400ms]"
      style={{
        backgroundColor: cell.color,
        border:          "1px solid rgba(255,255,255,0.06)",
      }}
      role="img"
      aria-label={`${cell.label}: ${cell.description}`}
    >
      {cell.imageSrc ? (
        <Image
          src={cell.imageSrc}
          alt={cell.label}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      ) : (
        <>
          {/* Background grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize:  "40px 40px",
            }}
            aria-hidden="true"
          />

          {/* Large label in background */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none"
            aria-hidden="true"
          >
            <span
              className="font-heading font-bold transition-opacity duration-[400ms] group-hover:opacity-5"
              style={{
                fontSize: "clamp(4rem, 10vw, 8rem)",
                color: cell.accent,
                opacity: 0.08,
                letterSpacing: "-0.04em",
              }}
            >
              {cell.label[0]}
            </span>
          </div>
        </>
      )}

      {/* Red accent corner line */}
      <div
        className="absolute top-0 left-0 w-16 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]"
        style={{ backgroundColor: "#E11D2E" }}
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        {/* Gradient */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${cell.color}ee 0%, transparent 60%)` }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <p
            className="font-mono text-xs uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]"
            style={{ color: cell.accent, letterSpacing: "0.12em" }}
          >
            {cell.description}
          </p>
          <h3
            className="font-heading font-semibold text-lg"
            style={{ letterSpacing: "-0.02em" }}
          >
            {cell.label}
          </h3>
        </div>
      </div>
    </div>
  );
}
