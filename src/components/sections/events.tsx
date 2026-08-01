import { SectionWrapper, SectionItem } from "@/components/ui/section-wrapper";
import { EventCard } from "@/components/ui/event-card";
import type { EventStatus } from "@/components/ui/event-card";

interface EventData {
  title:         string;
  subtitle?:     string;
  description:   string;
  status:        EventStatus;
  accentColor:   string;
  imagePlaceholder: string;
  imageSrc?:     string;
  registerHref?: string;
  large?:        boolean;
}

const EVENTS: EventData[] = [
  {
    title:       "UGX — Uber.Game X",
    subtitle:    "Annual Gaming Event",
    description:
      "Pakistan's largest university gaming tournament. Featuring CS:GO, FIFA, Valorant, and more across two unforgettable days at GIKI.",
    status:      "upcoming",
    accentColor: "#0D0D12",
    imagePlaceholder: "UGX",
    imageSrc: "/events/UGX_v2.jpeg",
    large:       true,
  },
  {
    title:       "Hack n Connect",
    subtitle:    "Hackathon",
    description:
      "A 24-hour hackathon challenging students to build innovative solutions to real-world networking and infrastructure problems.",
    status:      "upcoming",
    accentColor: "#0D120D",
    imagePlaceholder: "H&C",
    imageSrc: "/events/HNC_v2.jpeg",
  },
  {
    title:       "Inductions",
    subtitle:    "Society Recruitment",
    description:
      "Join NETRONiX. Open inductions for engineers, developers, event coordinators, and creative minds.",
    status:      "live",
    accentColor: "#120D0D",
    imagePlaceholder: "IND",
    imageSrc: "/events/Inductions.jpeg",
  },
  {
    title:       "Volunteer Call",
    subtitle:    "Open Call",
    description:
      "Help us run the largest events at GIKI. Volunteer for UGX, Hack n Connect, and SNP as crew, logistics, or tech support.",
    status:      "upcoming",
    accentColor: "#0D0D0D",
    imagePlaceholder: "VOL",
    imageSrc: "/events/Volcall.jpeg",
  },
  {
    title:       "SNP",
    subtitle:    "Society Night & Party",
    description:
      "NETRONiX's annual celebration. Live performances, food, and the entire GIKI community together under one roof.",
    status:      "past",
    accentColor: "#0A0A0A",
    imagePlaceholder: "SNP",
    imageSrc: "/events/SNP.jpeg",
  },
];

export function Events() {
  const [ugx, ...rest] = EVENTS;

  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      className="section-padding px-4 md:px-8 max-w-7xl mx-auto w-full"
    >
      <SectionWrapper className="flex flex-col gap-12" delay={0.05}>

        {/* ── Heading ────────────────────────────────────────────────────── */}
        <SectionItem className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p
              className="font-mono text-xs uppercase tracking-widest mb-4"
              style={{ color: "#E11D2E", letterSpacing: "0.12em" }}
            >
              Signature Events
            </p>
            <h2
              id="events-heading"
              className="font-heading font-semibold"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.75rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              Events
            </h2>
          </div>

          <p
            className="text-sm max-w-xs text-right hidden md:block"
            style={{ color: "#666666" }}
          >
            From annual gaming tournaments to hackathons — NETRONiX builds
            GIKI&apos;s most memorable experiences.
          </p>
        </SectionItem>

        {/* ── Cards grid ────────────────────────────────────────────────── */}
        <SectionItem>
          {/*
            Asymmetric layout:
            - Desktop: UGX spans 2 rows on the left; 2×2 grid on right
            - Mobile: single column stack
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Large UGX card — spans 2 rows on lg */}
            <div className="md:col-span-1 lg:row-span-2">
              <EventCard
                {...ugx}
                aspectClass="aspect-[4/3] lg:aspect-auto lg:min-h-[480px]"
              />
            </div>

            {/* Remaining 4 cards in 2×2 */}
            {rest.map((event) => (
              <EventCard key={event.title} {...event} />
            ))}
          </div>
        </SectionItem>

      </SectionWrapper>
    </section>
  );
}
