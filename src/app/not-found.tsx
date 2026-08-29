import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "404 — Halaman Tidak Ditemukan | LIand",
  },
  description:
    "Halaman yang kamu cari tidak ditemukan. Kembali ke portfolio LIand atau lihat resume Alfian Nur Usyaid.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen overflow-hidden px-6 py-8">
      <Image
        src="/img/hero-bg.jpg"
        alt=""
        fill
        priority
        quality={75}
        sizes="100vw"
        className="hero-bg-dark object-cover object-center"
        aria-hidden="true"
      />
      <Image
        src="/img/hero-bg-light.jpg"
        alt=""
        fill
        priority
        quality={80}
        sizes="100vw"
        className="hero-bg-light object-cover object-center"
        aria-hidden="true"
      />
      <div
        id="hero-overlay"
        className="absolute inset-0 bg-[var(--color-bg-primary)]/35"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[800px] flex-col">
        <Link
          href="/"
          className="w-fit text-lg font-bold tracking-tight text-accent no-underline transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          LIand
        </Link>

        <section className="my-auto max-w-[620px] py-16" aria-labelledby="not-found-title">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-accent" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Error 404
            </p>
          </div>

          <h1
            id="not-found-title"
            className="max-w-[580px] text-6xl font-bold leading-[1.05] tracking-tight max-md:text-5xl max-sm:text-4xl"
          >
            Halaman ini nyasar.
          </h1>
          <p className="mt-5 max-w-[540px] font-serif text-lg leading-8 text-[var(--color-text-primary)]/85 max-sm:text-base max-sm:leading-7">
            URL yang kamu buka nggak ada, sudah dipindah, atau mungkin cuma
            typo. Yuk pulangg, yukk
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Kembali ke Home
            </Link>
            <Link
              href="/resume"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--color-bg-tertiary)]/80 bg-[var(--color-bg-primary)]/45 px-4 text-sm font-semibold text-[var(--color-text-primary)] no-underline backdrop-blur-sm transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <FileText aria-hidden="true" size={16} />
              Lihat Resume
            </Link>
          </div>
        </section>

        <p className="text-xs text-[var(--color-text-secondary)]">
          portfolio.liand.web.id
        </p>
      </div>
    </main>
  );
}
