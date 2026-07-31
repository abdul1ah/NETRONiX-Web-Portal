/**
 * NETRONiX Motion System
 * Centralised animation constants for Framer Motion + GSAP.
 * Keep all durations, easings, and variants here for consistency.
 */

// ─── Durations (ms) ──────────────────────────────────────────────────────────
export const DURATION = {
  micro:   0.1,   // hover states, focus rings
  button:  0.25,  // button transitions
  card:    0.4,   // card reveals/hovers
  section: 0.6,   // section entrance reveals
  hero:    0.8,   // hero text reveal
  video:   1.2,   // video crossfades
} as const;

// ─── Easings ─────────────────────────────────────────────────────────────────
export const EASE = {
  smooth:    [0.25, 0.1, 0.25, 1.0] as const,
  out:       [0.0, 0.0, 0.2, 1.0]  as const,
  in:        [0.4, 0.0, 1.0, 1.0]  as const,
  inOut:     [0.4, 0.0, 0.2, 1.0]  as const,
  elegant:   [0.16, 1, 0.3, 1]     as const, // slow-out for hero reveals
} as const;

// ─── Framer Motion Variants ───────────────────────────────────────────────────

/** Fade in from slightly below — used for section content */
export const fadeUpVariant = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.section, ease: EASE.elegant },
  },
} as const;

/** Staggered children container */
export const staggerContainerVariant = (stagger = 0.1) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: stagger } },
});

/** Hero content reveal — slower, more cinematic */
export const heroRevealVariant = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.hero, ease: EASE.elegant },
  },
} as const;

/** Simple opacity fade */
export const fadeVariant = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.section, ease: EASE.smooth },
  },
} as const;

/** Scale in from slightly smaller — card entrance */
export const scaleInVariant = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.card, ease: EASE.elegant },
  },
} as const;

// ─── GSAP Defaults (pass to gsap.to / gsap.from) ─────────────────────────────
export const GSAP = {
  ease: {
    smooth:  'power2.inOut',
    out:     'power2.out',
    in:      'power2.in',
    elegant: 'power3.out',
  },
  duration: {
    micro:   DURATION.micro,
    button:  DURATION.button,
    card:    DURATION.card,
    section: DURATION.section,
    hero:    DURATION.hero,
    video:   DURATION.video,
  },
} as const;
