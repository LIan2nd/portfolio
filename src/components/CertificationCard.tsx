import Image from "next/image";
import { Award, ArrowRight } from "lucide-react";
import type { Certification } from "@/lib/types";

interface CertificationCardProps {
  certification: Certification;
}

export function CertificationCard({ certification }: CertificationCardProps) {
  const isImageLogo =
    certification.logo &&
    (certification.logo.startsWith("/") ||
      certification.logo.startsWith("http") ||
      /\.(png|jpe?g|svg|webp)$/i.test(certification.logo));

  const cardInner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 overflow-hidden p-2 text-accent">
          {isImageLogo ? (
            <Image
              src={certification.logo!}
              alt={certification.issuer}
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          ) : (
            <Award size={24} className="text-accent" />
          )}
        </div>
        <span className="text-xs opacity-60 font-medium px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)]">
          {certification.date}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
          {certification.title}
        </h3>
        <p className="text-sm text-accent font-medium mt-1">
          {certification.issuer}
        </p>
        {certification.credentialId && (
          <p className="text-xs opacity-60 font-mono mt-1">
            Credential ID: {certification.credentialId}
          </p>
        )}
      </div>

      {certification.skills && certification.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {certification.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] opacity-80"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {certification.credentialUrl && (
        <div className="mt-4 pt-3 border-t border-[var(--color-bg-tertiary)] flex items-center justify-between text-sm text-[var(--color-text-primary)]">
          <span className="font-medium text-xs text-accent">
            Show Credential
          </span>
          <ArrowRight
            size={16}
            className="text-accent -rotate-45 md:text-[var(--color-text-primary)] md:rotate-0 md:group-hover:text-accent md:group-hover:-rotate-45 md:group-hover:translate-x-0.5 md:group-hover:-translate-y-0.5 transition-all duration-200 ease-out"
          />
        </div>
      )}
    </>
  );

  if (certification.credentialUrl) {
    return (
      <a
        href={certification.credentialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-transparent hover:border-accent/30 active:scale-[0.98] flex flex-col justify-between text-left no-underline transition-all duration-200 cursor-pointer"
      >
        {cardInner}
      </a>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-transparent flex flex-col justify-between text-left">
      {cardInner}
    </div>
  );
}
