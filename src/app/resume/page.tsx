import type { Metadata } from "next";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import {
  EDUCATION_ENTRIES,
  PROJECTS,
  PUBLICATION,
  SKILLS,
  SOCIALS,
  WORK_ENTRIES,
} from "@/lib/data";
import {
  PERSON_ID,
  PROFILE_IMAGE_ID,
  PROFILE_IMAGE_URL,
  RESUME_DESCRIPTION,
  SITE_URL,
  WEBSITE_ID,
  personJsonLd,
  profileImageJsonLd,
} from "@/lib/seo";
import { PRIMARY_PROFILE_PHOTO } from "@/lib/profilePhotos";

export const metadata: Metadata = {
  title: {
    absolute: "Resume — Alfian Nur Usyaid",
  },
  description: RESUME_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/resume`,
  },
  openGraph: {
    title: "Resume — Alfian Nur Usyaid",
    description: RESUME_DESCRIPTION,
    url: `${SITE_URL}/resume`,
    siteName: "LIand",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: PROFILE_IMAGE_URL,
        width: PRIMARY_PROFILE_PHOTO.width,
        height: PRIMARY_PROFILE_PHOTO.height,
        alt: PRIMARY_PROFILE_PHOTO.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume — Alfian Nur Usyaid",
    description: RESUME_DESCRIPTION,
    images: [PROFILE_IMAGE_URL],
  },
};

const resumeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/resume#profilepage`,
      url: `${SITE_URL}/resume`,
      name: "Resume — Alfian Nur Usyaid",
      description: RESUME_DESCRIPTION,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
      primaryImageOfPage: { "@id": PROFILE_IMAGE_ID },
      inLanguage: "en-US",
    },
    profileImageJsonLd,
    personJsonLd,
  ],
};

const selectedProjects = PROJECTS.slice(0, 4);

export default function ResumePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resumeJsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-[var(--color-bg-tertiary)]/50 bg-[var(--color-bg-primary)]/90 px-6 backdrop-blur-md">
        <nav
          aria-label="Resume navigation"
          className="mx-auto flex min-h-16 max-w-[800px] items-center justify-between gap-4"
        >
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-accent no-underline transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            LIand
          </a>
          <div className="flex items-center gap-2">
            <a
              href="/"
              aria-label="Back to portfolio"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--color-text-primary)] no-underline transition-colors duration-200 hover:bg-[var(--color-bg-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              <span className="hidden sm:inline">Portfolio</span>
            </a>
            <a
              href="/resume.pdf"
              download
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-3.5 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Download aria-hidden="true" size={16} />
              <span>Download PDF</span>
            </a>
          </div>
        </nav>
      </header>

      <main className="px-6 py-12 md:py-16">
        <article className="mx-auto max-w-[800px]">
          <header className="border-b border-[var(--color-bg-tertiary)]/60 pb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Professional profile
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight max-sm:text-3xl">
              Resume — Alfian Nur Usyaid
            </h1>
            <p className="mt-4 max-w-[680px] font-serif text-base leading-7 text-[var(--color-text-primary)]/90">
              Computer Science graduate from STT Terpadu Nurul Fikri (GPA
              3.94) based in Bogor, specializing in software engineering and
              fullstack web development. Experienced with Next.js, React,
              Laravel, Flask, RESTful APIs, PostgreSQL, and MySQL.
            </p>
            <ul
              aria-label="Professional links"
              className="mt-5 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-sm"
            >
              {SOCIALS.filter((social) => social.platform !== "instagram").map(
                (social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 transition-colors duration-200 hover:underline"
                    >
                      {social.label}
                      <ExternalLink aria-hidden="true" size={13} />
                    </a>
                  </li>
                ),
              )}
            </ul>
          </header>

          <div className="grid gap-12 py-10 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)]">
            <div className="space-y-12">
              <section aria-labelledby="resume-experience">
                <h2
                  id="resume-experience"
                  className="text-2xl font-bold tracking-tight"
                >
                  Experience
                </h2>
                <div className="mt-5 space-y-6">
                  {WORK_ENTRIES.map((entry) => (
                    <article
                      key={`${entry.title}-${entry.dateRange}`}
                      className="border-l-2 border-accent/40 pl-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div>
                          <h3 className="font-bold leading-snug">
                            {entry.title}
                          </h3>
                          <p className="mt-0.5 text-sm font-medium text-accent">
                            {entry.subtitle}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                          {entry.dateRange}
                        </p>
                      </div>
                      {entry.description?.[0] && (
                        <p className="mt-2 font-serif text-sm leading-6 text-[var(--color-text-primary)]/85">
                          {entry.description[0]}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="resume-projects">
                <h2
                  id="resume-projects"
                  className="text-2xl font-bold tracking-tight"
                >
                  Selected Projects
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {selectedProjects.map((project) => (
                    <article
                      key={project.title}
                      className="rounded-xl border border-[var(--color-bg-tertiary)]/60 bg-[var(--color-bg-secondary)] p-5"
                    >
                      <h3 className="font-bold leading-snug">
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-text-primary)] underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                          >
                            {project.title}
                          </a>
                        ) : (
                          project.title
                        )}
                      </h3>
                      <p className="mt-2 font-serif text-sm leading-6 text-[var(--color-text-primary)]/85">
                        {project.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="resume-research">
                <h2
                  id="resume-research"
                  className="text-2xl font-bold tracking-tight"
                >
                  Research &amp; Publication
                </h2>
                <article className="mt-5 rounded-xl border border-[var(--color-bg-tertiary)]/60 bg-[var(--color-bg-secondary)] p-5">
                  <h3 className="font-bold leading-snug">
                    <a
                      href={PUBLICATION.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-text-primary)] underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                    >
                      {PUBLICATION.title}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {PUBLICATION.authors.join(", ")} · {PUBLICATION.journal} ·{" "}
                    {PUBLICATION.year}
                  </p>
                  <p className="mt-3 font-serif text-sm leading-6 text-[var(--color-text-primary)]/85">
                    Research on student retention prediction using SMOTE,
                    Random Forest, and Genetic Algorithm optimization.
                  </p>
                  <a
                    href={PUBLICATION.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    View DOI
                    <ExternalLink aria-hidden="true" size={13} />
                  </a>
                </article>
              </section>
            </div>

            <aside className="space-y-10" aria-label="Resume details">
              <section aria-labelledby="resume-skills">
                <h2
                  id="resume-skills"
                  className="text-xl font-bold tracking-tight"
                >
                  Technical Skills
                </h2>
                <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
                  {SKILLS.map((skill) => (
                    <li
                      key={skill.name}
                      className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="resume-education">
                <h2
                  id="resume-education"
                  className="text-xl font-bold tracking-tight"
                >
                  Education
                </h2>
                <div className="mt-4 space-y-5">
                  {EDUCATION_ENTRIES.map((entry) => (
                    <article key={`${entry.title}-${entry.dateRange}`}>
                      <h3 className="text-sm font-bold leading-snug">
                        {entry.title}
                      </h3>
                      <p className="mt-1 text-sm text-accent">
                        {entry.subtitle}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {entry.dateRange}
                      </p>
                      {entry.description?.[0] && (
                        <p className="mt-2 font-serif text-sm leading-6 text-[var(--color-text-primary)]/85">
                          {entry.description[0]}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <section aria-labelledby="resume-document">
                <h2
                  id="resume-document"
                  className="text-xl font-bold tracking-tight"
                >
                  Full CV
                </h2>
                <p className="mt-3 font-serif text-sm leading-6 text-[var(--color-text-primary)]/85">
                  The downloadable PDF contains the compact one-page version of
                  this resume and was last updated in August 2026.
                </p>
                <a
                  href="/resume.pdf"
                  download
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-accent px-4 text-sm font-semibold text-accent no-underline transition-colors duration-200 hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Download aria-hidden="true" size={16} />
                  Download resume PDF
                </a>
              </section>
            </aside>
          </div>
        </article>
      </main>

      <footer className="border-t border-[var(--color-bg-tertiary)]/50 px-6 py-8">
        <div className="mx-auto flex max-w-[800px] flex-col gap-2 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>LIand — the personal portfolio of Alfian Nur Usyaid.</p>
          <a
            href="/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Visit portfolio
          </a>
        </div>
      </footer>
    </>
  );
}
