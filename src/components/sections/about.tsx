import { SectionWrapper, SectionItem } from "@/components/ui/section-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import TextAnimation from "@/components/ui/staggerText";
import { RulerCarousel } from "@/components/ui/ruler-carousel";

const STATS = [
  { value: 2000, suffix: "+", label: "Students Connected",  delay: 0   },
  { value: 50,   suffix: "TB+", label: "Shared Data",        delay: 100 },
  { value: 18,   suffix: "+",  label: "Years of UGX",        delay: 200 },
  { value: 24,   suffix: "/7", label: "Infrastructure",      delay: 300 },
] as const;

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="px-4 md:px-8 max-w-7xl mx-auto w-full"
      style={{ paddingTop: "7rem", paddingBottom: "7rem" }}
    >
      <SectionWrapper className="flex flex-col gap-16" delay={0.05}>

        {/* ── Heading block ─────────────────────────────────────────────── */}
        <SectionItem className="max-w-3xl">
          {/* Eyebrow */}
          <p
            className="font-mono text-xs uppercase tracking-widest mb-5"
            style={{ color: "#E11D2E", letterSpacing: "0.12em" }}
          >
            About NETRONiX
          </p>

          <h2
            id="about-heading"
            className="font-heading font-semibold text-balance mb-6"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            <TextAnimation delay={0.1}>Powering Every</TextAnimation>
            <br />
            <TextAnimation delay={0.3}>Connection</TextAnimation>
          </h2>

          <p
            className="text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: "#B3B3B3" }}
          >
            <TextAnimation delay={0.5}>
              NETRONiX is the infrastructure and events backbone of Ghulam Ishaq
              Khan Institute — engineering the campus network, running Pakistan&apos;s
              premier student gaming events, and fostering the next generation of
              network engineers.
            </TextAnimation>
          </p>
        </SectionItem>

        {/* ── Stats Carousel ──────────────────────────────────────────────── */}
        <SectionItem>
          <div className="w-full overflow-hidden">
            <RulerCarousel
              autoLoop={true}
              originalItems={STATS.map((stat, i) => ({
                id: i,
                content: (
                  <StatCard
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    delay={0}
                  />
                ),
              }))}
            />
          </div>
        </SectionItem>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <SectionItem>
          <div
            className="w-full h-px rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            aria-hidden="true"
          />
        </SectionItem>

      </SectionWrapper>
    </section>
  );
}
