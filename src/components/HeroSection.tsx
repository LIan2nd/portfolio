import Image from "next/image";

export function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Hero introduction"
      className="h-screen flex flex-col items-center justify-end px-6 pb-20 max-sm:justify-center max-sm:text-center relative overflow-hidden"
    >
      {/* Optimized Background Image via Next.js Image */}
      <Image
        src="/img/hero-bg.jpg"
        alt=""
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-bottom"
        style={{ zIndex: -2 }}
        aria-hidden="true"
      />
      {/* Theme-aware Gradient Overlay (styled via globals.css) */}
      <div
        id="hero-overlay"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      />

      <div className="w-full max-w-[800px] mx-auto relative" style={{ zIndex: 1 }}>
        <p className="text-sm opacity-70 mb-1">Hi, there, I&apos;m</p>
        <h1 className="text-7xl max-lg:text-5xl max-sm:text-3xl font-bold text-[var(--color-text-primary)] font-sans leading-tight">
          Alfian Nur Usyaid
        </h1>
        <p className="text-xl max-sm:text-lg font-serif text-accent mt-3">
          Fullstack Web Developer — Next.js, Laravel &amp; Blockchain
        </p>
        <div className="h-px bg-accent/40 w-full mt-6 mb-4" />
        <small className="text-[var(--color-text-primary)] opacity-60 text-xs">
          Photo by{" "}
          <a
            href="https://unsplash.com/@auchynnikau?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
            className="text-accent hover:underline transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Slava Auchynnikau
          </a>{" "}
          on{" "}
          <a
            href="https://unsplash.com/photos/the-night-sky-with-stars-above-a-mountain-DdjQaVxAqRA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
            className="text-accent hover:underline transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
        </small>
      </div>
    </section>
  );
}
