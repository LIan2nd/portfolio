import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GalleryItem } from "../domain/types";

interface GalleryCardProps {
  item: GalleryItem;
}

export function GalleryCard({ item }: GalleryCardProps) {
  return (
    <article className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-[var(--color-bg-tertiary)]/50 bg-[var(--color-bg-secondary)]/45 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-xl hover:shadow-accent/5">
      <Link
        href={`/gallery/${item.id}`}
        className="group block text-inherit no-underline"
        aria-label={`View ${item.title}`}
      >
        <div className="relative overflow-hidden bg-[var(--color-bg-secondary)]">
          <Image
            src={item.imageUrl}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />
          <span className="absolute right-3 top-3 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={17} aria-hidden="true" />
          </span>
        </div>
        <div className="p-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {item.title}
          </h2>
          <p className="mt-1.5 line-clamp-2 font-serif text-sm leading-6 text-[var(--color-text-secondary)]">
            {item.description}
          </p>
        </div>
      </Link>
    </article>
  );
}
