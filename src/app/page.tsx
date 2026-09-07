import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { CertificationsSection } from "@/components/CertificationsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { LazyAiAssistant } from "@/components/LazyAiAssistant";
import {
  NAV_LINKS,
  SKILLS,
  PERSONAL_DETAILS,
  SOCIALS,
  WORK_ENTRIES,
  EDUCATION_ENTRIES,
  PROJECTS,
  CERTIFICATIONS,
  PUBLICATION,
} from "@/lib/data";
import {
  HOME_DESCRIPTION,
  PERSON_ID,
  PROFILE_IMAGE_ID,
  SITE_URL,
  WEBSITE_ID,
  personJsonLd,
  profileImageJsonLd,
} from "@/lib/seo";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: "LIand",
      alternateName: "Alfian Nur Usyaid",
      description: HOME_DESCRIPTION,
      creator: { "@id": PERSON_ID },
      inLanguage: "en-US",
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      name: "Alfian Nur Usyaid — Fullstack Web Developer",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
      primaryImageOfPage: { "@id": PROFILE_IMAGE_ID },
      inLanguage: "en-US",
    },
    profileImageJsonLd,
    personJsonLd,
    {
      "@type": "ScholarlyArticle",
      "@id": `${SITE_URL}/#publication-mind-journal`,
      headline: PUBLICATION.title,
      alternativeHeadline: PUBLICATION.alternativeTitle,
      author: PUBLICATION.authors.map((name) =>
        name === "Alfian Nur Usyaid"
          ? { "@id": PERSON_ID }
          : { "@type": "Person", name },
      ),
      datePublished: PUBLICATION.year,
      isPartOf: {
        "@type": "Periodical",
        name: PUBLICATION.journal,
        publisher: {
          "@type": "Organization",
          name: "Institut Teknologi Nasional Bandung",
        },
      },
      url: PUBLICATION.url,
      sameAs: PUBLICATION.doi,
      about: PUBLICATION.topics,
    },
    ...PROJECTS.map((project) => ({
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#project-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: project.title,
      description: project.description,
      applicationCategory: "WebApplication",
      author: { "@id": PERSON_ID },
      ...(project.url ? { url: project.url } : {}),
      ...(project.image ? { image: `${SITE_URL}${project.image}` } : {}),
    })),
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#featured-projects`,
      name: "Featured Projects by Alfian Nur Usyaid",
      numberOfItems: PROJECTS.length,
      itemListElement: PROJECTS.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        description: project.description,
        ...(project.url ? { url: project.url } : {}),
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-accent focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white text-sm font-semibold transition-all duration-200"
      >
        Skip to main content
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar links={NAV_LINKS} />
      <main id="main-content">
        <HeroSection />
        <AboutSection
          skills={SKILLS}
          details={PERSONAL_DETAILS}
          socials={SOCIALS}
        />
        <ExperienceSection
          workEntries={WORK_ENTRIES}
          educationEntries={EDUCATION_ENTRIES}
        />
        <ProjectsSection projects={PROJECTS} />
        <CertificationsSection certifications={CERTIFICATIONS} />
        <ContactSection />
      </main>
      <Footer socials={SOCIALS} />
      <LazyAiAssistant />
    </>
  );
}
