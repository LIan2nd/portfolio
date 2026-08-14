import Image from "next/image";
import type { Skill, PersonalDetail, SocialLink } from "@/lib/types";
import { SkillBadge } from "./SkillBadge";
import { InstagramIcon, GithubIcon, LinkedinIcon } from "./icons/SocialIcons";

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
    <section id="about" aria-label="About Alfian Nur Usyaid" className="py-20 px-6 max-md:py-12">
      <div className="max-w-[960px] mx-auto">
        <div className="flex gap-8 max-md:flex-col">
          <Image
            src="/img/hero.png"
            alt="Alfian Nur Usyaid - Fullstack Developer"
            width={320}
            height={380}
            priority
            className="w-[320px] max-md:w-full h-[380px] object-cover rounded-lg opacity-90 shrink-0"
          />
          <div className="flex flex-col gap-4 justify-between">
            <div>
              <span className="text-accent text-sm uppercase tracking-wider">Discover</span>
              <h2 className="text-4xl max-sm:text-3xl font-bold mt-1 mb-4">
                About Me
              </h2>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {skills.map((skill) => (
                  <SkillBadge key={skill.name} name={skill.name} />
                ))}
              </div>
            </div>
            <p className="font-serif leading-7 text-base opacity-90">
              Computer Science graduate (<strong>Cumlaude, GPA 3.94</strong>) with a strong focus on{" "}
              <strong>Fullstack Web Development &amp; Software Engineering</strong>. Experienced in building scalable, maintainable applications applying{" "}
              <strong>SOLID principles</strong>, <strong>OOP</strong>, and <strong>Clean Code</strong> practices using{" "}
              <strong>JavaScript/TypeScript (Next.js)</strong>, <strong>PHP (Laravel)</strong>, <strong>Python (Flask)</strong>, and <strong>PostgreSQL</strong>.
            </p>
            <div className="border border-accent/30 rounded-lg p-4">
              <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-3">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <span className="font-semibold text-xs text-accent uppercase tracking-wide">
                      {detail.label}
                    </span>
                    <p className="text-sm mt-0.5">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-md text-accent border border-accent/20 hover:bg-accent hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer inline-flex items-center justify-center"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
