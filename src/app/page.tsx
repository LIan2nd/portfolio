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
  CONTACT_SCRIPT_URL,
} from "@/lib/data";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://portfolio.liand.web.id/#website",
      url: "https://portfolio.liand.web.id",
      name: "Alfian Nur Usyaid — Fullstack Web Developer Portfolio",
      description:
        "Portfolio of Alfian Nur Usyaid — Fullstack Developer in Next.js, Laravel, and Blockchain. Cumlaude CS graduate (GPA 3.94) based in Bogor, Indonesia.",
      inLanguage: "en-US",
    },
    {
      "@type": "ProfilePage",
      "@id": "https://portfolio.liand.web.id/#profilepage",
      url: "https://portfolio.liand.web.id",
      name: "Alfian Nur Usyaid — Fullstack Web Developer",
      isPartOf: { "@id": "https://portfolio.liand.web.id/#website" },
      mainEntity: { "@id": "https://portfolio.liand.web.id/#person" },
      primaryImageOfPage: {
        "@type": "ImageObject",
        "url": "https://portfolio.liand.web.id/img/profile/profile-1.png",
        "caption": "Alfian Nur Usyaid — Fullstack Web Developer",
        "representativeOfPage": true
      },
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
        "https://www.instagram.com/wonder__liand",
      ],
      email: "alfiannurusyaid19[at]gmail.com",
      image: {
        "@type": "ImageObject",
        "url": "https://portfolio.liand.web.id/img/profile/profile-1.png",
        "caption": "Alfian Nur Usyaid",
        "representativeOfPage": true
      },
      award: "Cumlaude (GPA 3.94/4.00)",
      knowsLanguage: ["Indonesian", "English"],
      hasCredential: [
        {
          "@type": "EducationalOccupationalCredential",
          name: "Bachelor of Computer Science (S.Kom)",
          credentialCategory: "degree",
          educationalLevel: "Bachelor's Degree",
          recognizedBy: {
            "@type": "CollegeOrUniversity",
            name: "STT Terpadu Nurul Fikri",
          },
        },
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://portfolio.liand.web.id/#service",
      name: "Alfian Nur Usyaid — Fullstack Web Development & Software Engineering",
      url: "https://portfolio.liand.web.id",
      image: "https://portfolio.liand.web.id/img/profile/profile-1.png",
      description:
        "Professional fullstack web development and software engineering services specializing in Next.js, React, TypeScript, Laravel, and Blockchain solutions.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bogor",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -6.5971,
        longitude: 106.806,
      },
      priceRange: "$$",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      provider: {
        "@id": "https://portfolio.liand.web.id/#person",
      },
    },
    {
      "@type": "ScholarlyArticle",
      "@id": "https://portfolio.liand.web.id/#publication-mind-journal",
      headline:
        "Model Prediksi Retensi Mahasiswa Berbasis Random Forest Yang Dioptimasi Dengan Algoritma Genetika",
      alternativeHeadline:
        "Student Retention Prediction with Genetic Algorithm-Optimized Random Forest and SMOTE",
      author: [
        { "@type": "Person", name: "Pudy Prima" },
        { "@type": "Person", name: "Ahmad Rio Adriansyah" },
        { "@id": "https://portfolio.liand.web.id/#person" },
      ],
      datePublished: "2026",
      isPartOf: {
        "@type": "Periodical",
        name: "MIND Journal",
        publisher: {
          "@type": "Organization",
          name: "Institut Teknologi Nasional Bandung",
        },
      },
      url: "https://ejurnal.itenas.ac.id/index.php/mindjournal/article/view/15673",
      about: [
        "Random Forest",
        "Genetic Algorithm",
        "SMOTE",
        "Student Retention",
        "Machine Learning",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://portfolio.liand.web.id/#project-roadsense",
      name: "RoadSense",
      description:
        "Smart GIS road damage mapping and navigation with crowdsourced reporting and intelligent alternative routing.",
      applicationCategory: "WebApplication",
      author: { "@id": "https://portfolio.liand.web.id/#person" },
      url: "https://github.com/LIan2nd/RoadSense",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://portfolio.liand.web.id/#project-digiarc",
      name: "DigiArc",
      description:
        "Decentralized Web3 file storage platform on IPFS with Solidity smart contracts.",
      applicationCategory: "WebApplication",
      author: { "@id": "https://portfolio.liand.web.id/#person" },
      url: "https://digiarc.vercel.app",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://portfolio.liand.web.id/#project-esao",
      name: "ESAO",
      description:
        "AI-powered automated essay grading system for university lecturers using LangChain and rubric-based semantic evaluation.",
      applicationCategory: "WebApplication",
      author: { "@id": "https://portfolio.liand.web.id/#person" },
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
        <ContactSection scriptUrl={CONTACT_SCRIPT_URL} />
      </main>
      <Footer socials={SOCIALS} />
      <LazyAiAssistant />
    </>
  );
}
