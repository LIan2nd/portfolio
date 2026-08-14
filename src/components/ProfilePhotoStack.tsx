"use client";

import { useState, useRef, useCallback } from "react";
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
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, isTouchDevice: false });
  const total = PROFILE_PHOTOS.length;

  const cycleNext = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    // Brief delay for the exit animation to settle, then swap index
    setTimeout(() => {
      setTopIndex((prev) => (prev + 1) % total);
      setIsExiting(false);
    }, 280);
  }, [isExiting, total]);

  // ─── Touch handlers (mobile only) ───
  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current.isTouchDevice = true;
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.startY = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;

    // If scrolling vertically more than horizontally, let the page scroll
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 10) return;

    setSwipeX(dx);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    // Threshold: swipe far enough or flick fast enough → cycle
    if (Math.abs(swipeX) > 45) {
      cycleNext();
    }

    setSwipeX(0);
  };

  // ─── Click handler (desktop only, ignore if touch device) ───
  const handleClick = () => {
    // Prevent double-fire on touch devices (touchEnd already handles it)
    if (touchRef.current.isTouchDevice) {
      touchRef.current.isTouchDevice = false;
      return;
    }
    cycleNext();
  };

  return (
    <div className="flex flex-col items-center shrink-0 max-md:w-full select-none">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          setIsSwiping(false);
          setSwipeX(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            cycleNext();
          }
        }}
        aria-label="Swipe or click to view next profile photo"
        className="group relative w-[280px] h-[360px] max-md:w-full max-md:max-w-[320px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
      >
        {PROFILE_PHOTOS.map((photo, index) => {
          const position = (index - topIndex + total) % total;

          // ─── Style per layer ───
          let style: React.CSSProperties = {};
          let className = "absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)]";

          if (position === 0) {
            // ▸ Top card: full opacity, follows finger on mobile
            const dragRotate = isSwiping ? swipeX * 0.06 : 0;
            const dragX = isSwiping ? swipeX : 0;
            style = {
              zIndex: 40,
              transform: `translateX(${dragX}px) rotate(${dragRotate}deg)`,
              transition: isSwiping ? "none" : "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            };
            className += " shadow-2xl border-2 border-white/15 dark:border-white/10";
          } else if (position === 1) {
            // ▸ 2nd card: subtle peek right
            style = {
              zIndex: 30,
              transform: "rotate(3deg) translateX(8px) translateY(4px) scale(0.97)",
              transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
            };
            className += " shadow-lg border border-white/10 dark:border-white/5";
          } else if (position === 2) {
            // ▸ 3rd card: subtle peek left
            style = {
              zIndex: 20,
              transform: "rotate(-3deg) translateX(-8px) translateY(6px) scale(0.94)",
              transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
            };
            className += " shadow-md border border-white/5 dark:border-white/[0.03]";
          } else {
            // ▸ Hidden behind the stack
            style = {
              zIndex: 10,
              transform: "translateY(8px) scale(0.91)",
              opacity: 0,
              transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
            };
            className += " shadow-sm";
          }

          return (
            <div key={photo.src} style={style} className={className}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 320px, 280px"
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
