"use client";

import Image from "next/image";
import { Expand } from "lucide-react";
import type { GalleryItem } from "../domain/types";

interface GalleryCardProps {
  item: GalleryItem;
  onOpen: (trigger: HTMLButtonElement) => void;
}

export function GalleryCard({ item, onOpen }: GalleryCardProps) {
  return (
    <article className="mb-5 break-inside-avoid">
      <button
        type="button"
        onClick={(event) => onOpen(event.currentTarget)}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-bg-secondary)] p-0 text-left shadow-lg shadow-black/10 transition-all duration-500 hover:-translate-y-1 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg-primary)]"
        aria-label={`Preview ${item.title}`}
      >
        <Image
          src={item.imageUrl}
          alt={item.alt}
          width={item.width}
          height={item.height}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] group-focus-visible:scale-[1.035]"
        />

        <span className="absolute inset-0 bg-gradient-to-t from-[#010913]/95 via-[#010913]/25 to-transparent opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" />
        <span className="absolute inset-x-0 bottom-0 translate-y-0 p-5 text-white opacity-100 transition-all duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
          <span className="flex items-end justify-between gap-4">
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-6 tracking-tight sm:text-lg">
                {item.title}
              </span>
              <span className="mt-1.5 line-clamp-2 block font-serif text-sm leading-6 text-slate-200 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                {item.description}
              </span>
            </span>
            <span className="mb-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md sm:inline-flex">
              <Expand size={17} aria-hidden="true" />
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}
