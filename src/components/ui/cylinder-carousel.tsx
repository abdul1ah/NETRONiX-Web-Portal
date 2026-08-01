"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  items: React.ReactNode[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // in seconds
  cardWidth?: number | string; // in pixels or CSS value
  aspectRatio?: string; // CSS aspect-ratio
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      items,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 32,
      cardWidth = 280,
      aspectRatio = "7/10",
      ...props
    },
    ref
  ) => {
    const N = items.length;
    
    // We compute the CSS variables here instead of polluting the global CSS
    // --n: number of cards
    // --w: card width
    const customStyle = {
      "--n": N,
      "--w": typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
      "--ba": `calc(1turn / var(--n))`,
      // animation duration
      "--anim-dur": `${animationDuration}s`,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-full min-h-[500px] grid place-items-center overflow-hidden",
          className
        )}
        style={{
          perspective: "35em",
          maskImage: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
        }}
        {...props}
      >
        <div
          className={cn(
            "grid place-items-center [transform-style:preserve-3d] motion-reduce:!animate-[ry_128s_linear_infinite]",
            containerClassName
          )}
          style={{
            ...customStyle,
            animation: "ry var(--anim-dur) linear infinite",
          }}
        >
          {/* We define the keyframes inline via a style block to ensure it works without global CSS config */}
          <style>
            {`
              @keyframes ry {
                to { transform: rotateY(1turn); }
              }
            `}
          </style>
          
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "[grid-area:1/1] rounded-2xl [backface-visibility:hidden] overflow-hidden",
                cardClassName
              )}
              style={{
                width: "var(--w)",
                aspectRatio: aspectRatio,
                "--i": i,
                transform: "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * (0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))",
              } as React.CSSProperties}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CylinderCarousel.displayName = "CylinderCarousel";
