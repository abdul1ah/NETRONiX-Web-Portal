# NETRONiX Network Society 

The official frontend for the NETRONiX Network Society, built with Next.js 16, Tailwind CSS, Framer Motion, and WebGL.

## 🚀 Recent Major Updates (UI/UX Overhaul)

This project recently underwent a massive architectural and design polish pass. Here are the main highlights of the changes:

### 1. 🌊 Immersive Scroll & Layout
- **Lenis Smooth Scrolling:** Integrated Lenis to hijack native scroll behavior, delivering buttery-smooth, 60fps scrolling across the entire application.
- **Cinematic Bridge Fix:** The video bridge between the Hero and About sections now properly freezes on the final glowing logo frame and locks its height (`48vh`), completely eliminating the buggy "scroll teleportation" layout jump.
- **Mobile Optimizations:** Fixed iOS `100svh` address bar issues in the Hero and applied responsive fluid typography (`clamp()`) universally.

### 2. 🧠 WebGL Neural Noise Background
- Integrated a bespoke WebGL shader (`neural-noise.tsx`) that generates an interactive, high-performance red neural static pattern.
- Spanned the WebGL container seamlessly across the **Community** and **Open Positions** sections to create a massive, edge-to-edge immersive environment.

### 3. 🔊 Zero-Dependency Web Audio Engine
- Built a custom `SoundEngine` using the native browser `AudioContext` API (`src/lib/audio.ts`) with zero external dependencies.
- Added a subtle, futuristic ascending "bloop" for hovering over primary CTAs and navigation items.
- Added a satisfying tactile "clack" when users submit the Complaint form or open the mobile drawer.

### 4. 🧭 Next-Gen Navigation
- Built a custom **Spotlight Navbar** that tracks mouse movement with a radial gradient glow, and uses `IntersectionObserver` to highlight the current scroll section automatically.
- Rebuilt the mobile menu into a beautiful glassmorphic drawer with full keyboard focus-trapping (`Tab` & `Escape`) for WCAG accessibility.

### 5. 💅 Visual & Build Polish
- Added a custom SVG icon (`icon.svg`) for the browser tab.
- Re-wired the Complaint Portal SVG status tracker to animate beautifully on progression.
- Cleaned up the footer, wired live Instagram and LinkedIn links, and ensured external links safely open in new tabs (`target="_blank"`).
- Added fallback `poster` images to all background videos to prevent black boxes on slow 3G networks.
- Fortified the Next.js compiler config (removed experimental css optimization that was crashing Vercel).

## 🛠 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + Custom CSS Variables
- **Animations:** Framer Motion (Layouts) + GSAP (ScrollTriggers)
- **Forms:** React Hook Form + Zod
- **Graphics:** Raw WebGL Canvas APIs
