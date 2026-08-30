import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import {
  NAVBAR_BRAND_CLASS,
  NAVBAR_ROW_CLASS,
  NAVBAR_TOP_SPACING_CLASS,
} from "@/lib/navigationStyles";

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
    <main className="relative h-screen max-h-screen overflow-hidden">
      <div
        id="not-found-background"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
      <div
        id="not-found-overlay"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 h-full px-6">
        <div className="mx-auto flex h-full w-full max-w-[800px] flex-col">
          <header className="shrink-0">
            <nav
              aria-label="404 navigation"
              className={`${NAVBAR_ROW_CLASS} ${NAVBAR_TOP_SPACING_CLASS}`}
            >
              <span
                className="relative -ml-1 h-7 w-8 shrink-0 md:hidden"
                aria-hidden="true"
              />
              <div className="col-start-3 flex items-center justify-self-end gap-2.5 md:col-start-1 md:justify-self-start">
                <Link
                  href="/"
                  aria-label="LIand home"
                  className={NAVBAR_BRAND_CLASS}
                >
                  LIand
                </Link>
                <span className="h-7 w-7 md:hidden" aria-hidden="true" />
                <span className="-mr-1 h-7 w-7 md:hidden" aria-hidden="true" />
              </div>
            </nav>
          </header>

          <section
            className="flex min-h-0 flex-1 items-center"
            aria-labelledby="not-found-title"
          >
            <div className="max-w-[620px]">
              <div className="mb-[clamp(1rem,3vh,1.5rem)] flex items-center gap-3">
                <span className="h-px w-10 bg-accent" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Error 404
                </p>
              </div>

              <h1
                id="not-found-title"
                className="max-w-[580px] text-[clamp(2.25rem,7vw,3.75rem)] font-bold leading-[1.05] tracking-tight"
              >
                Halaman ini nyasar.
              </h1>
              <p className="mt-[clamp(0.75rem,2.5vh,1.25rem)] max-w-[540px] font-serif text-base leading-7 text-[var(--color-text-primary)]/90 sm:text-lg sm:leading-8">
                URL yang kamu buka nggak ada, sudah dipindah, atau mungkin cuma
                typo. Yuk pulangg, yukk
              </p>

              <div className="mt-[clamp(1rem,3.5vh,2rem)] flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <ArrowLeft aria-hidden="true" size={16} />
                  Kembali ke Home
                </Link>
                <Link
                  href="/resume"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--color-bg-tertiary)]/80 bg-[var(--color-bg-primary)]/75 px-4 text-sm font-semibold text-[var(--color-text-primary)] no-underline backdrop-blur-sm transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <FileText aria-hidden="true" size={16} />
                  Lihat Resume
                </Link>
              </div>
            </div>
          </section>

          <p className="shrink-0 pb-[clamp(1rem,4vh,2rem)] text-xs text-[var(--color-text-secondary)]">
            portfolio.liand.web.id
          </p>
        </div>
      </div>
    </main>
  );
}
