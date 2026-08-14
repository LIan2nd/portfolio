import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { CertificationsSection } from "@/components/CertificationsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import {
  NAV_LINKS,
  SKILLS,
  PERSONAL_DETAILS,
  SOCIALS,
  WORK_ENTRIES,
  EDUCATION_ENTRIES,
  PROJECTS,
  CERTIFICATIONS,
  CONTACT_SCRIPT_URL,
} from "@/lib/data";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://portfolio.liand.web.id/#website",
      url: "https://portfolio.liand.web.id",
      name: "Alfian Nur Usyaid Portfolio",
      description:
        "Portfolio of Alfian Nur Usyaid — Fullstack Developer specializing in Next.js, Laravel, Flask, and Blockchain.",
      inLanguage: "en-US",
    },
    {
      "@type": "ProfilePage",
      "@id": "https://portfolio.liand.web.id/#profilepage",
      url: "https://portfolio.liand.web.id",
      name: "Alfian Nur Usyaid — Fullstack Developer",
      isPartOf: { "@id": "https://portfolio.liand.web.id/#website" },
      mainEntity: { "@id": "https://portfolio.liand.web.id/#person" },
      inLanguage: "en-US",
    },
    {
      "@type": "Person",
      "@id": "https://portfolio.liand.web.id/#person",
      name: "Alfian Nur Usyaid",
      alternateName: "LIand",
      url: "https://portfolio.liand.web.id",
      jobTitle: "Fullstack Developer",
      description:
        "Computer Science graduate (Cumlaude, GPA 3.94) specializing in Fullstack Web Development using Next.js, Laravel, Flask, and Blockchain.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bogor",
        addressCountry: "ID",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "STT Terpadu Nurul Fikri",
      },
      knowsAbout: [
        "JavaScript",
        "TypeScript",
        "PHP",
        "Python",
        "Next.js",
        "React",
        "Laravel",
        "Flask",
        "PostgreSQL",
        "MongoDB",
        "Blockchain",
        "Solidity",
      ],
      sameAs: [
        "https://github.com/LIan2nd/",
        "https://linkedin.com/in/alfian-nur-usyaid/",
        "https://instagram.com/lforthissielu/",
      ],
      email: "alfiannurusyaid19@gmail.com",
      image: "https://portfolio.liand.web.id/img/hero.png",
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
        <ContactSection scriptUrl={CONTACT_SCRIPT_URL} />
      </main>
      <Footer socials={SOCIALS} />
    </>
  );
}
