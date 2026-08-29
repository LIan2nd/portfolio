import { SOCIALS } from "@/lib/data";
import { PRIMARY_PROFILE_PHOTO } from "@/lib/profilePhotos";

export const SITE_URL = "https://portfolio.liand.web.id";
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/#person`;
export const PROFILE_IMAGE_URL = `${SITE_URL}${PRIMARY_PROFILE_PHOTO.src}`;
export const PROFILE_IMAGE_ID = `${PROFILE_IMAGE_URL}#image`;

export const HOME_DESCRIPTION =
  "Portfolio of Alfian Nur Usyaid — Fullstack Web Developer & Software Engineer specializing in Next.js, React, Laravel, and Blockchain development.";

export const RESUME_DESCRIPTION =
  "Resume of Alfian Nur Usyaid, a Software Engineer and Fullstack Web Developer, covering experience, education, projects, research, and technical skills.";

export const profileImageJsonLd = {
  "@type": "ImageObject",
  "@id": PROFILE_IMAGE_ID,
  url: PROFILE_IMAGE_URL,
  contentUrl: PROFILE_IMAGE_URL,
  width: PRIMARY_PROFILE_PHOTO.width,
  height: PRIMARY_PROFILE_PHOTO.height,
  caption: "Alfian Nur Usyaid — Software Engineer",
  representativeOfPage: true,
};

export const personJsonLd = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Alfian Nur Usyaid",
  alternateName: "LIand",
  url: `${SITE_URL}/`,
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
  sameAs: SOCIALS.map((social) => social.url),
  image: { "@id": PROFILE_IMAGE_ID },
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
};
