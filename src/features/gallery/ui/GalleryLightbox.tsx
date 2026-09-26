"use client";

import Image from "next/image";
import { CalendarDays, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryItem } from "../domain/types";

interface GalleryLightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function GalleryLightbox({ item, onClose }: GalleryLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!mounted || !item) return null;

  const date = item.takenAt ?? item.createdAt;
  const dateLabel = item.takenAt ? "Captured" : "Added";
  const titleId = `gallery-lightbox-title-${item.id}`;
  const descriptionId = `gallery-lightbox-description-${item.id}`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#010812]/90 p-3 backdrop-blur-xl sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="animate-tab-slide relative grid max-h-[94dvh] w-full max-w-[1240px] overflow-y-auto rounded-2xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-primary)] shadow-2xl shadow-black/60 lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition-colors hover:border-white/30 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-4 sm:top-4"
          aria-label="Close photo preview"
        >
          <X size={19} aria-hidden="true" />
        </button>

        <div className="flex min-h-[280px] items-center justify-center overflow-hidden bg-black/55 lg:min-h-[620px]">
          <Image
            src={item.imageUrl}
            alt={item.alt}
            width={item.width}
            height={item.height}
            quality={100}
            sizes="(max-width: 1024px) 100vw, 880px"
            priority
            className="max-h-[64dvh] h-auto w-auto max-w-full object-contain lg:max-h-[88dvh]"
          />
        </div>

        <div className="flex flex-col justify-end border-t border-[var(--color-bg-tertiary)] p-6 text-[var(--color-text-primary)] lg:border-l lg:border-t-0 lg:p-8">
          <span className="mb-auto hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-accent lg:block">
            Through my lens
          </span>
          <h2
            id={titleId}
            className="pr-10 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:pr-0"
          >
            {item.title}
          </h2>
          <p
            id={descriptionId}
            className="mt-4 whitespace-pre-wrap font-serif text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base"
          >
            {item.description}
          </p>
          <p className="mt-6 flex items-center gap-2 border-t border-[var(--color-bg-tertiary)] pt-5 text-xs text-[var(--color-text-secondary)]">
            <CalendarDays size={14} aria-hidden="true" />
            {dateLabel} {formatDate(date)}
          </p>
        </div>
      </article>
    </div>,
    document.body,
  );
}
