"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { Rewind, FastForward } from "lucide-react";

export interface CarouselItem {
  id: string | number;
  content: ReactNode;
}

// Create infinite items by triplicating the array
const createInfiniteItems = (originalItems: CarouselItem[]) => {
  const items = [];
  for (let i = 0; i < 3; i++) {
    originalItems.forEach((item, index) => {
      items.push({
        ...item,
        id: `${i}-${item.id}`,
        originalIndex: index,
      });
    });
  }
  return items;
};

const RulerLines = ({
  top = true,
  totalLines = 100,
}: {
  top?: boolean;
  totalLines?: number;
}) => {
  const lines = [];
  const lineSpacing = 100 / (totalLines - 1);

  for (let i = 0; i < totalLines; i++) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);

    let height = "h-3";
    let color = "bg-gray-500 dark:bg-gray-400";

    if (isCenter) {
      height = "h-8";
      color = "bg-primary dark:bg-white";
    } else if (isFifth) {
      height = "h-4";
      color = "bg-primary dark:bg-white";
    }

    const positionClass = top ? "" : "bottom-0";

    lines.push(
      <div
        key={i}
        className={`absolute w-0.5 ${height} ${color} ${positionClass} opacity-20`}
        style={{ left: `${i * lineSpacing}%` }}
      />
    );
  }

  return <div className="relative w-full h-8 px-4">{lines}</div>;
};

export function RulerCarousel({
  originalItems,
  autoLoop = true,
}: {
  originalItems: CarouselItem[];
  autoLoop?: boolean;
}) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;

  // Start with the middle set, centered
  const [activeIndex, setActiveIndex] = useState(itemsPerSet + Math.floor(itemsPerSet / 2));
  const [isResetting, setIsResetting] = useState(false);
  const previousIndexRef = useRef(activeIndex);

  const handleItemClick = (newIndex: number) => {
    if (isResetting) return;
    const targetOriginalIndex = newIndex % itemsPerSet;
    const possibleIndices = [
      targetOriginalIndex,
      targetOriginalIndex + itemsPerSet,
      targetOriginalIndex + itemsPerSet * 2,
    ];

    let closestIndex = possibleIndices[0];
    let smallestDistance = Math.abs(possibleIndices[0] - activeIndex);

    for (const index of possibleIndices) {
      const distance = Math.abs(index - activeIndex);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    }

    previousIndexRef.current = activeIndex;
    setActiveIndex(closestIndex);
  };

  const handlePrevious = () => {
    if (isResetting) return;
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isResetting) return;
    setActiveIndex((prev) => prev + 1);
  };

  // Auto loop left to right
  useEffect(() => {
    if (!autoLoop || isResetting) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoLoop, isResetting]);

  // Handle infinite scrolling reset
  useEffect(() => {
    if (activeIndex < itemsPerSet) {
      setIsResetting(true);
      setActiveIndex((prev) => prev + itemsPerSet);
    } else if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true);
      setActiveIndex((prev) => prev - itemsPerSet);
    }
  }, [activeIndex, itemsPerSet]);

  // Turn off resetting flag after the instant jump has been rendered
  useEffect(() => {
    if (isResetting) {
      let raf1: number;
      let raf2: number;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setIsResetting(false);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
  }, [isResetting]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isResetting) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((prev) => prev - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResetting]);

  // Center target based on active index
  // Each item is 350px wide + 50px gap = 400px step
  const itemWidth = 400; 
  // Track is positioned at left-1/2. We shift it left by the active item's center position.
  const targetX = -(activeIndex * itemWidth + 175);

  const currentPage = (activeIndex % itemsPerSet) + 1;
  const totalPages = itemsPerSet;

  return (
    <div className="w-full flex flex-col items-center justify-center bg-transparent">
      <div className="w-full py-8 flex flex-col justify-center relative overflow-hidden">
        <div className="flex items-center justify-center">
          <RulerLines top />
        </div>
        
        {/* Main track */}
        <div className="flex items-center w-full min-h-[160px] relative mt-6 mb-6">
          <motion.div
            className="flex items-center absolute left-1/2"
            style={{ gap: "50px" }}
            animate={{ x: isResetting ? targetX : targetX }}
            transition={
              isResetting
                ? { duration: 0 }
                : { type: "tween", ease: "easeInOut", duration: 0.8 }
            }
          >
            {infiniteItems.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => handleItemClick(index)}
                  className="cursor-pointer flex items-center justify-center"
                  animate={{
                    scale: isActive ? 1 : 0.8,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={
                    isResetting
                      ? { duration: 0 }
                      : { type: "tween", ease: "easeInOut", duration: 0.8 }
                  }
                  style={{ width: "350px" }}
                >
                  <div className="pointer-events-none w-full">
                    {item.content}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="flex items-center justify-center">
          <RulerLines top={false} />
        </div>
      </div>
    </div>
  );
}
