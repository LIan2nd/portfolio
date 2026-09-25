"use client";

import { useCallback, useRef, useState } from "react";
import type { GalleryItem } from "../domain/types";
import { GalleryCard } from "./GalleryCard";
import { GalleryLightbox } from "./GalleryLightbox";

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openItem = useCallback(
    (item: GalleryItem, trigger: HTMLButtonElement) => {
      triggerRef.current = trigger;
      setSelectedItem(item);
    },
    [],
  );

  const closeItem = useCallback(() => {
    setSelectedItem(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  return (
    <>
      <section
        aria-label="Photo collection"
        className="mx-auto max-w-[1120px] columns-1 gap-5 sm:columns-2 lg:columns-3"
      >
        {items.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            onOpen={(trigger) => openItem(item, trigger)}
          />
        ))}
      </section>
      <GalleryLightbox item={selectedItem} onClose={closeItem} />
    </>
  );
}
