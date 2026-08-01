"use client";

import { useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Node { x: number; y: number }
interface Edge { from: Node; to: Node }

// ─── Network topology (fixed for reproducibility) ────────────────────────────

const NODES: Node[] = [
  { x: 60,  y: 40  },
  { x: 160, y: 20  },
  { x: 240, y: 80  },
  { x: 140, y: 120 },
  { x: 40,  y: 130 },
  { x: 220, y: 160 },
  { x: 100, y: 180 },
  { x: 290, y: 50  },
];

const EDGES: Edge[] = [
  { from: NODES[0], to: NODES[1] },
  { from: NODES[1], to: NODES[2] },
  { from: NODES[2], to: NODES[3] },
  { from: NODES[3], to: NODES[0] },
  { from: NODES[3], to: NODES[4] },
  { from: NODES[2], to: NODES[5] },
  { from: NODES[5], to: NODES[6] },
  { from: NODES[6], to: NODES[4] },
  { from: NODES[1], to: NODES[7] },
  { from: NODES[7], to: NODES[2] },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Subtle animated network topology behind the Network Core card.
 * GSAP is loaded lazily so it doesn't block the initial bundle.
 * Animates one red signal dot per edge every 5–8 seconds.
 */
export function NetworkLines() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const dotsRef = useRef<(SVGCircleElement | null)[]>([]);
  // Store GSAP tweens for cleanup
  const tlsRef  = useRef<{ kill: () => void }[]>([]);

  useEffect(() => {
    let cancelled = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduleSignal = (gsap: any, dot: SVGCircleElement, edge: Edge, delay: number) => {
      const tl = gsap.fromTo(
        dot,
        { attr: { cx: edge.from.x, cy: edge.from.y }, opacity: 0 },
        {
          attr: { cx: edge.to.x, cy: edge.to.y },
          opacity: 1,
          duration: 1.8,
          ease: "power2.inOut",
          delay,
          onStart: () => gsap.set(dot, { opacity: 1 }),
          onComplete: () => {
            gsap.to(dot, { opacity: 0, duration: 0.3 });
            const nextDelay = 5 + Math.random() * 3;
            const nextEdge  = EDGES[Math.floor(Math.random() * EDGES.length)];
            scheduleSignal(gsap, dot, nextEdge, nextDelay);
          },
        }
      );
      tlsRef.current.push(tl);
    };

    // Lazy-load GSAP — only downloaded when this component mounts
    import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      EDGES.forEach((edge, i) => {
        const dot = dotsRef.current[i];
        if (!dot) return;
        const delay = i * 0.9 + Math.random() * 2;
        scheduleSignal(gsap, dot, edge, delay);
      });
    });

    return () => {
      cancelled = true;
      tlsRef.current.forEach((tl) => tl?.kill());
      tlsRef.current = [];
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 200"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.35 }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Static network edges */}
      {EDGES.map((edge, i) => (
        <line
          key={`edge-${i}`}
          x1={edge.from.x} y1={edge.from.y}
          x2={edge.to.x}   y2={edge.to.y}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.8"
        />
      ))}

      {/* Static nodes */}
      {NODES.map((node, i) => (
        <circle
          key={`node-${i}`}
          cx={node.x} cy={node.y} r="2"
          fill="rgba(255,255,255,0.15)"
        />
      ))}

      {/* Animated signal dots — one per edge */}
      {EDGES.map((edge, i) => (
        <circle
          key={`dot-${i}`}
          ref={(el) => { dotsRef.current[i] = el; }}
          cx={edge.from.x} cy={edge.from.y}
          r="2.5"
          fill="#E11D2E"
          style={{
            filter: "drop-shadow(0 0 3px #FF3B4D)",
            opacity: 0,
          }}
        />
      ))}
    </svg>
  );
}
