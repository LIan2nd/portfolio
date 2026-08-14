"use client";

import { useState } from "react";
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
