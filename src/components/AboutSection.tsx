"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import type { Skill, PersonalDetail, SocialLink } from "@/lib/types";
import { SkillBadge } from "./SkillBadge";
import { InstagramIcon, GithubIcon, LinkedinIcon } from "./icons/SocialIcons";

import { ProfilePhotoStack } from "./ProfilePhotoStack";

interface AboutSectionProps {
  skills: Skill[];
  details: PersonalDetail[];
  socials: SocialLink[];
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "instagram":
      return <InstagramIcon size={16} />;
    case "github":
      return <GithubIcon size={16} />;
    case "linkedin":
      return <LinkedinIcon size={16} />;
    default:
      return <GithubIcon size={16} />;
  }
}

export function AboutSection({ skills, details, socials }: AboutSectionProps) {
  return (
    <section id="about" aria-label="About Alfian Nur Usyaid" className="py-10 md:py-14 px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="flex gap-8 max-md:flex-col items-center md:items-start">
          <ProfilePhotoStack />
          <div className="flex flex-col gap-4 justify-between flex-1 min-w-0 w-full">
            <div>
              <span className="text-accent text-xs font-semibold uppercase tracking-widest">Discover</span>
              <h2 className="text-3xl max-sm:text-2xl font-bold mt-1 mb-3">
                About Me
              </h2>
              <h3 className="sr-only">Fullstack Web Developer & Software Engineer</h3>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skills.map((skill) => (
                  <SkillBadge key={skill.name} name={skill.name} />
                ))}
              </div>
            </div>
            <p className="font-serif leading-7 text-sm opacity-90">
              Computer Science (<em>fresh</em>) graduate with a strong focus on{" "}
              <strong>Fullstack Web Development &amp; Software Engineering</strong>. Experienced in building scalable, maintainable applications applying{" "}
              <strong>SOLID principles</strong>, <strong>OOP</strong>, and <strong>Clean Code</strong> practices using{" "}
              <strong>JavaScript/TypeScript (Next.js)</strong>, <strong>PHP (Laravel)</strong>, <strong>Python (Flask)</strong>, and <strong>PostgreSQL</strong>.
            </p>
            <div className="border border-[var(--color-bg-tertiary)]/50 bg-[var(--color-bg-secondary)]/60 rounded-xl p-4 shadow-xs">
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-x-4 gap-y-3">
                {details.map((detail) => (
                  <div key={detail.label} className="min-w-0">
                    <span className="font-semibold text-[11px] text-accent uppercase tracking-wider block">
                      {detail.label}
                    </span>
                    <p 
                      className={`text-sm mt-0.5 text-[var(--color-text-primary)] truncate ${detail.isEmail ? "cursor-pointer hover:text-accent transition-colors" : ""}`} 
                      title={detail.value}
                      onClick={detail.isEmail ? () => window.location.href = `mailto:${detail.value.replace("[at]", "@")}` : undefined}
                    >
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <a
                href="/file/myResume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-accent text-[var(--color-text-primary)] hover:text-white border border-[var(--color-bg-tertiary)]/70 hover:border-accent text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer shadow-xs no-underline"
              >
                <FileText size={14} className="text-accent group-hover:text-white transition-colors duration-200" />
                <span>Resume</span>
              </a>
              <div className="h-4 w-px bg-[var(--color-bg-tertiary)]/60 mx-1 hidden sm:block" />
              <div className="flex gap-2">
                {socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="p-2 rounded-lg text-accent border border-accent/20 hover:bg-accent hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
