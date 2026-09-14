import { HeroBackground } from "./hero-background/HeroBackground";

export function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Hero introduction"
      className="h-screen flex flex-col items-center justify-end px-6 pb-20 max-sm:justify-center max-sm:text-center relative isolate overflow-hidden"
    >
      <HeroBackground />

      <div className="w-full max-w-[800px] mx-auto relative pb-6" style={{ zIndex: 1 }}>
        <p className="text-sm opacity-70 mb-1">Hi, there, I&apos;m</p>
        <h1 className="text-7xl max-lg:text-5xl max-sm:text-3xl font-bold text-[var(--color-text-primary)] font-sans leading-tight">
          Alfian Nur Usyaid
        </h1>
        <p className="text-xl max-sm:text-lg font-serif text-accent mt-3">
          Fullstack Web Developer — Next.js, Laravel &amp; Blockchain
        </p>
        <div className="h-px bg-accent/40 w-full mt-6 mb-4" />
      </div>
    </section>
  );
}
