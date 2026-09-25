import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LazyAiAssistant } from "@/components/LazyAiAssistant";
import { galleryService } from "@/features/gallery";
import {
  ADDITIONAL_NAV_LINKS,
  ROOT_NAV_LINKS,
  SOCIALS,
} from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: GalleryDetailPageProps): Promise<Metadata> {
  const item = await galleryService.find((await params).id);
  if (!item) return { title: "Photo not found" };
  return {
    title: item.title,
    description: item.description.slice(0, 155),
    alternates: { canonical: `${SITE_URL}/gallery/${item.id}` },
    openGraph: {
      title: item.title,
      description: item.description,
      url: `${SITE_URL}/gallery/${item.id}`,
      type: "article",
      images: [
        {
          url: item.imageUrl,
          width: item.width,
          height: item.height,
          alt: item.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.description,
      images: [item.imageUrl],
    },
  };
}

export default async function GalleryDetailPage({
  params,
}: GalleryDetailPageProps) {
  const item = await galleryService.find((await params).id);
  if (!item) notFound();

  return (
    <>
      <Navbar
        links={ROOT_NAV_LINKS}
        additionalLinks={ADDITIONAL_NAV_LINKS}
        homeHref="/"
      />
      <main id="main-content" className="min-h-screen px-5 pb-16 pt-28 sm:px-8">
        <article className="mx-auto max-w-[1040px]">
          <Link
            href="/gallery"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] no-underline transition-colors duration-200 hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to gallery
          </Link>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-bg-tertiary)]/50 bg-[var(--color-bg-secondary)] shadow-2xl shadow-black/10">
            <Image
              src={item.imageUrl}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 1080px) 100vw, 1040px"
              priority
              className="h-auto max-h-[78vh] w-full object-contain"
            />
          </div>

          <div className="mx-auto max-w-3xl py-8 sm:py-10">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {item.title}
            </h1>
            <p className="mt-5 whitespace-pre-wrap font-serif text-base leading-8 text-[var(--color-text-secondary)]">
              {item.description}
            </p>
            <p className="mt-6 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]/80">
              <CalendarDays size={14} aria-hidden="true" />
              {item.takenAt
                ? `Captured ${formatDate(item.takenAt)}`
                : `Added ${formatDate(item.createdAt)}`}
            </p>
          </div>
        </article>
      </main>
      <Footer socials={SOCIALS} />
      <LazyAiAssistant />
    </>
  );
}
