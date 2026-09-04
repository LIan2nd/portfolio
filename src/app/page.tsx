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
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#project-leath-notes`,
      name: "Leath Notes",
      description:
        "Skeuomorphic online notepad with folders, autosave, guest mode, authentication, and optional multi-provider AI assistance.",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Any",
      author: { "@id": PERSON_ID },
      url: "https://leath-note.my.id",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#project-roadsense`,
      name: "RoadSense",
      description:
        "Smart GIS road damage mapping and navigation with crowdsourced reporting and intelligent alternative routing.",
      applicationCategory: "WebApplication",
      author: { "@id": PERSON_ID },
      url: "https://github.com/LIan2nd/RoadSense",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#project-digiarc`,
      name: "DigiArc",
      description:
        "Decentralized Web3 file storage platform on IPFS with Solidity smart contracts.",
      applicationCategory: "WebApplication",
      author: { "@id": PERSON_ID },
      url: "https://digiarc.vercel.app",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#project-esao`,
      name: "ESAO",
      description:
        "AI-powered automated essay grading system for university lecturers using LangChain and rubric-based semantic evaluation.",
      applicationCategory: "WebApplication",
      author: { "@id": PERSON_ID },
      url: "https://esao.nurulfikri.ac.id",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar links={NAV_LINKS} />
      <main>
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
