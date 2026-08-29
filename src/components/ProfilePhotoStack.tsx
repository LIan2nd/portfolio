"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { ProfilePhoto } from "@/lib/profilePhotos";

interface ProfilePhotoStackProps {
  photos: readonly ProfilePhoto[];
}

export function ProfilePhotoStack({ photos }: ProfilePhotoStackProps) {
  const [topIndex, setTopIndex] = useState(0);
  const total = photos.length;

  const cycleNext = useCallback(() => {
    setTopIndex((prev) => (prev + 1) % total);
  }, [total]);

  return (
    <div className="flex shrink-0 select-none flex-col items-center max-md:w-full">
      <div className="group relative h-[360px] w-[280px] max-w-full max-md:w-full max-md:max-w-[320px]">
        {photos.map((photo, index) => {
          const position = (index - topIndex + total) % total;

          let style: React.CSSProperties = {};
          let className =
            "absolute inset-0 h-full w-full overflow-hidden rounded-2xl bg-[var(--color-bg-secondary)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

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
            <figure
              key={photo.src}
              aria-hidden={position === 0 ? undefined : true}
              style={style}
              className={className}
            >
              <Image
                src={photo.src}
                overrideSrc={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 768px) 320px, 280px"
                loading="lazy"
                className="pointer-events-none h-full w-full object-cover"
              />
            </figure>
          );
        })}

        <button
          type="button"
          onClick={cycleNext}
          aria-label={`Show next photo of Alfian Nur Usyaid. Currently showing photo ${topIndex + 1} of ${total}.`}
          className="absolute inset-0 z-50 cursor-pointer rounded-2xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        />
      </div>

      <div
        role="group"
        aria-label="Choose a photo of Alfian Nur Usyaid"
        className="mt-2 flex items-center justify-center"
      >
        {photos.map((photo, index) => {
          const isActive = index === topIndex;

          return (
            <button
              key={photo.src}
              type="button"
              onClick={() => setTopIndex(index)}
              aria-label={`Show photo ${index + 1} of ${total}: ${photo.alt}`}
              aria-pressed={isActive}
              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none ${
                  isActive
                    ? "w-5 bg-accent"
                    : "w-1.5 bg-[var(--color-text-secondary)]/45"
                }`}
              />
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Showing photo {topIndex + 1} of {total}: {photos[topIndex]?.alt}
      </p>
    </div>
  );
}
