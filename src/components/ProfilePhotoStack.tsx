"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Layers } from "lucide-react";

export const PROFILE_PHOTOS = [
  {
    src: "/img/profile/profile-1.png",
    alt: "Alfian Nur Usyaid - Fullstack Developer",
    caption: "LIand ⚡",
  },
  {
    src: "/img/profile/profile-2.jpg",
    alt: "Alfian Nur Usyaid - Profile Photo 2",
    caption: "Moments ✨",
  },
  {
    src: "/img/profile/profile-3.jpg",
    alt: "Alfian Nur Usyaid - Profile Photo 3",
    caption: "Vibes ☕",
  },
  {
    src: "/img/profile/profile-4.jpg",
    alt: "Alfian Nur Usyaid - Profile Photo 4",
    caption: "Smile 🌟",
  },
];

export function ProfilePhotoStack() {
  const [topIndex, setTopIndex] = useState(0);
  const total = PROFILE_PHOTOS.length;

  const handleNext = () => {
    setTopIndex((prev) => (prev + 1) % total);
  };

  return (
    <div className="flex flex-col items-center shrink-0 max-md:w-full select-none">
      {/* Interactive Photo Stack Card Deck */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleNext}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNext();
          }
        }}
        aria-label="Click to shuffle profile photo"
        className="group relative w-[280px] h-[360px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
      >
        {PROFILE_PHOTOS.map((photo, index) => {
          // Calculate relative position from current top card (0 = top, 1 = second, etc.)
          const position = (index - topIndex + total) % total;

          let transformClasses = "";
          let zIndex = 10;
          let opacity = "opacity-100";

          if (position === 0) {
            // Front / Active Card
            zIndex = 40;
            opacity = "opacity-100";
            transformClasses =
              "rotate-0 translate-x-0 translate-y-0 scale-100 group-hover:-rotate-2 group-hover:-translate-y-1";
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
              style={{ zIndex }}
              className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 dark:border-white/10 bg-[var(--color-bg-secondary)] transition-all duration-500 ease-out will-change-transform ${transformClasses} ${opacity}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="280px"
                priority={position === 0}
                className="object-cover pointer-events-none"
              />

              {/* Glossy Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

              {/* Subtle Photo Caption Pill (Visible on Front Card) */}
              {position === 0 && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white/90 text-[11px] font-medium border border-white/10 shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent" />
                    {photo.caption}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white/80 text-[10px] font-mono border border-white/10">
                    {topIndex + 1}/{total}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Helper Hint */}
      <button
        type="button"
        onClick={handleNext}
        className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-accent transition-colors cursor-pointer focus:outline-none"
        aria-label="Shuffle next photo"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Click to shuffle photos</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)] font-mono">
          {topIndex + 1}/{total}
        </span>
      </button>
    </div>
  );
}
