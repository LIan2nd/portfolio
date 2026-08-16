"use client";

import { useState, useCallback } from "react";
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
  const total = PROFILE_PHOTOS.length;

  const cycleNext = useCallback(() => {
    setTopIndex((prev) => (prev + 1) % total);
  }, [total]);

  return (
    <div className="flex flex-col items-center shrink-0 max-md:w-full select-none">
      <div
        role="button"
        tabIndex={0}
        onClick={cycleNext}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            cycleNext();
          }
        }}
        aria-label="Click to view next profile photo"
        className="group relative w-[280px] h-[360px] max-md:w-full max-md:max-w-[320px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
      >
        {PROFILE_PHOTOS.map((photo, index) => {
          const position = (index - topIndex + total) % total;

          let style: React.CSSProperties = {};
          let className =
            "absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

          if (position === 0) {
            style = { zIndex: 40 };
            className +=
              " shadow-2xl border-2 border-white/15 dark:border-white/10";
          } else if (position === 1) {
            style = {
              zIndex: 30,
              transform:
                "rotate(3deg) translateX(8px) translateY(4px) scale(0.97)",
            };
            className +=
              " shadow-lg border border-white/10 dark:border-white/5";
          } else if (position === 2) {
            style = {
              zIndex: 20,
              transform:
                "rotate(-3deg) translateX(-8px) translateY(6px) scale(0.94)",
            };
            className +=
              " shadow-md border border-white/5 dark:border-white/[0.03]";
          } else {
            style = {
              zIndex: 10,
              transform: "translateY(8px) scale(0.91)",
              opacity: 0,
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
                priority={false}
                className="object-cover pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
