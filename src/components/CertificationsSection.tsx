import type { Certification } from "@/lib/types";
import { CertificationCard } from "./CertificationCard";

interface CertificationsSectionProps {
  certifications: Certification[];
}

export function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  return (
    <section id="certifications" aria-label="Professional certifications" className="py-10 md:py-14 px-6 text-center">
      <div className="max-w-[800px] mx-auto">
        <span className="text-accent text-xs font-semibold uppercase tracking-widest">
          Credentials
        </span>
        <h2 className="text-3xl max-sm:text-2xl font-bold mt-1 mb-4">
          Certifications
        </h2>
        <p className="font-serif leading-7 text-sm opacity-90 mb-8 max-w-[620px] mx-auto">
          Professional credentials and verified certifications in fullstack web development,
          software engineering, Next.js, React, and UI/UX design — earned from recognized
          platforms including Udemy, IBM SkillsBuild, RevoU, and LearningX.
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
