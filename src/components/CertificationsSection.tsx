import type { Certification } from "@/lib/types";
import { CertificationCard } from "./CertificationCard";

interface CertificationsSectionProps {
  certifications: Certification[];
}

export function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  return (
    <section
      id="certificates"
      aria-label="Certificates"
      className="py-10 md:py-14 px-6 text-center scroll-mt-20"
    >
      <span id="certifications" className="sr-only" />
      <div className="max-w-[800px] mx-auto">
        <span className="text-accent text-xs font-semibold uppercase tracking-widest">
          Credentials
        </span>
        <h2 className="text-3xl max-sm:text-2xl font-bold mt-1 mb-4">
          Certificates
        </h2>
        <p className="font-serif leading-7 text-sm opacity-90 mb-8 max-w-[620px] mx-auto">
          Course certificates and verified credentials in cloud computing,
          fullstack web development, software engineering, Next.js, React, and
          UI/UX design — earned from recognized platforms including Dicoding
          Indonesia, Udemy, IBM SkillsBuild, RevoU, and LearningX.
        </p>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          {certifications.map((cert, index) => (
            <CertificationCard key={index} certification={cert} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const CertificatesSection = CertificationsSection;
