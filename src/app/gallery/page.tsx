import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LazyAiAssistant } from "@/components/LazyAiAssistant";
import { GalleryCard } from "@/features/gallery/ui/GalleryCard";
import { loadGalleryItems } from "@/features/gallery";
import {
  ADDITIONAL_NAV_LINKS,
  ROOT_NAV_LINKS,
  SOCIALS,
} from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gallery — Skies, Landscapes & Quiet Moments",
  description:
    "A personal photo gallery by Alfian Nur Usyaid, collecting skies, landscapes, and everyday moments worth remembering.",
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: {
    title: "Gallery — Alfian Nur Usyaid",
    description:
      "Skies, landscapes, and everyday moments photographed by Alfian Nur Usyaid.",
    url: `${SITE_URL}/gallery`,
    type: "website",
  },
};

export default async function GalleryPage() {
  const items = await loadGalleryItems();

  return (
    <>
      <Navbar
        links={ROOT_NAV_LINKS}
        additionalLinks={ADDITIONAL_NAV_LINKS}
        homeHref="/"
      />
      <main id="main-content" className="min-h-screen px-5 pb-16 pt-32 sm:px-8">
        <header className="mx-auto mb-10 max-w-[960px] text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Through my lens
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight max-sm:text-3xl">
            Gallery
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-serif text-base leading-7 text-[var(--color-text-secondary)]">
            A small archive of skies, landscapes, and ordinary moments that
            felt worth keeping.
          </p>
        </header>

        {items.length > 0 ? (
          <section
            aria-label="Photo collection"
            className="mx-auto max-w-[1120px] columns-1 gap-5 sm:columns-2 lg:columns-3"
          >
            {items.map((item) => (
              <GalleryCard key={item.id} item={item} />
            ))}
          </section>
        ) : (
          <section className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-dashed border-[var(--color-bg-tertiary)]/70 bg-[var(--color-bg-secondary)]/35 px-6 py-16 text-center">
            <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Camera size={24} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold">The first frame is coming</h2>
            <p className="mt-2 max-w-sm font-serif text-sm leading-6 text-[var(--color-text-secondary)]">
              This space is ready for the skies, places, and quiet details I
              capture along the way.
            </p>
          </section>
        )}
      </main>
      <Footer socials={SOCIALS} />
      <LazyAiAssistant />
    </>
  );
}
