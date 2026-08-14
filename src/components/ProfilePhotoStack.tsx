"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export const PROFILE_PHOTOS = [
  {
    src: "/img/profile/profile-1.png",
    alt: "Alfian Nur Usyaid - Fullstack Developer",
  },
  {
    src: "/img/profile/profile-2.jpg",
    alt: "Alfian Nur Usyaid - Profile Photo 2",
  },
  {
    src: "/img/profile/profile-3.jpg",
    alt: "Alfian Nur Usyaid - Profile Photo 3",
  },
  {
    src: "/img/profile/profile-4.jpg",
    alt: "Alfian Nur Usyaid - Profile Photo 4",
  },
];

export function ProfilePhotoStack() {
  const [topIndex, setTopIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({
    x: 0,
    y: 0,
    time: 0,
  });
  const isSwipingRef = useRef(false);
  const total = PROFILE_PHOTOS.length;

  const handleNext = () => {
    setTopIndex((prev) => (prev + 1) % total);
  };

  // Touch & Swipe Event Handlers for Mobile & Pointer
  const handleTouchStart = (e: React.TouchEvent) => {
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    setIsDragging(true);
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      isSwipingRef.current = true;
    }

    setDragOffset({ x: dx, y: dy * 0.25 });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const dx = dragOffset.x;
    const elapsedTime = Date.now() - touchStartRef.current.time;
    const isQuickFlick = Math.abs(dx) > 30 && elapsedTime < 300;
    const isSignificantSwipe = Math.abs(dx) > 50;

    if (isQuickFlick || isSignificantSwipe) {
      handleNext();
    } else if (!isSwipingRef.current && elapsedTime < 250) {
      // Tap without swipe -> cycle photo
      handleNext();
    }

    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center shrink-0 max-md:w-full select-none">
      {/* Interactive Swipeable Photo Stack Card Deck */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleNext}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNext();
          }
        }}
        aria-label="Swipe or click to view next profile photo"
        className="group relative w-[280px] h-[360px] cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl touch-pan-y"
      >
        {PROFILE_PHOTOS.map((photo, index) => {
          // Calculate relative position from current top card (0 = top, 1 = second, etc.)
          const position = (index - topIndex + total) % total;

          let transformClasses = "";
          let zIndex = 10;
          let opacity = "opacity-100";
          let dynamicStyle: React.CSSProperties = { zIndex };

          if (position === 0) {
            // Front / Active Card (follows finger during touch drag)
            zIndex = 40;
            opacity = "opacity-100";
            if (isDragging) {
              dynamicStyle = {
                zIndex: 40,
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.08
                  }deg)`,
                transition: "none",
              };
            } else {
              transformClasses =
                "rotate-0 translate-x-0 translate-y-0 scale-100 group-hover:-rotate-2 group-hover:-translate-y-1";
            }
          } else if (position === 1) {
            // 2nd Card (Right Fan-Out)
            zIndex = 30;
            opacity = "opacity-90";
            transformClasses =
              "rotate-[4deg] translate-x-2.5 translate-y-2 scale-[0.98] group-hover:rotate-[9deg] group-hover:translate-x-8 group-hover:translate-y-1 group-hover:scale-100 group-hover:opacity-95";
          } else if (position === 2) {
            // 3rd Card (Left Fan-Out)
            zIndex = 20;
            opacity = "opacity-80";
            transformClasses =
              "-rotate-[4deg] -translate-x-2.5 translate-y-4 scale-[0.96] group-hover:-rotate-[10deg] group-hover:-translate-x-8 group-hover:translate-y-2 group-hover:scale-100 group-hover:opacity-95";
          } else {
            // 4th Card (Bottom / Back Peek)
            zIndex = 10;
            opacity = "opacity-60";
            transformClasses =
              "rotate-[7deg] translate-x-1 translate-y-5 scale-[0.93] group-hover:rotate-[3deg] group-hover:translate-y-5 group-hover:scale-95 group-hover:opacity-75";
          }

          return (
            <div
              key={photo.src}
              style={dynamicStyle}
              className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 dark:border-white/10 bg-[var(--color-bg-secondary)] ${isDragging && position === 0
                  ? ""
                  : "transition-all duration-500 ease-out will-change-transform"
                } ${transformClasses} ${opacity}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="280px"
                priority={position === 0}
                className="object-cover pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
