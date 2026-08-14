import type { Certification } from "@/lib/types";
import { CertificationCard } from "./CertificationCard";

interface CertificationsSectionProps {
  certifications: Certification[];
}

export function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  return (
    <section id="certifications" aria-label="Professional certifications" className="py-20 px-6 max-md:py-12 text-center">
      <div className="max-w-[800px] mx-auto">
        <span className="text-accent text-xs font-semibold uppercase tracking-widest">
          Credentials
        </span>
        <h2 className="text-3xl max-sm:text-2xl font-bold mt-1 mb-8">
          Certifications
        </h2>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          {certifications.map((cert, index) => (
            <CertificationCard key={index} certification={cert} />
          ))}
        </div>
      </div>
    </section>
  );
}
