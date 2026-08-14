export function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Hero introduction"
      className="h-screen flex flex-col items-center justify-end px-6 pb-20 max-sm:justify-center max-sm:text-center bg-cover bg-bottom bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(2,21,38,0.98), rgba(2,21,38,0.06)), url('/img/hero-bg.jpg')`,
      }}
    >
      <style>{`
        [data-theme="light"] #home {
          background-image: linear-gradient(0deg, rgba(255,255,255,0.9), rgba(255,255,255,0.1)), url('https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') !important;
        }
      `}</style>

      <div className="w-full max-w-[800px] mx-auto">
        <p className="text-sm opacity-70 mb-1">Hi, there</p>
        <h1 className="text-7xl max-lg:text-5xl max-sm:text-3xl font-bold text-[var(--color-text-primary)] font-sans leading-tight">
          I&apos;m Programmer
        </h1>
        <p className="text-xl max-sm:text-lg font-serif text-accent mt-3">
          Specializing in Next.js, Laravel &amp; Blockchain Ecosystem
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
