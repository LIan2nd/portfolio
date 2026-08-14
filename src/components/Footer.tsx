import type { SocialLink } from "@/lib/types";
import { InstagramIcon, GithubIcon, LinkedinIcon } from "./icons/SocialIcons";

interface FooterProps {
  socials: SocialLink[];
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "instagram":
      return <InstagramIcon size={18} />;
    case "github":
      return <GithubIcon size={18} />;
    case "linkedin":
      return <LinkedinIcon size={18} />;
    default:
      return <GithubIcon size={18} />;
  }
}

export function Footer({ socials }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full px-6 pt-10 pb-14 md:pt-14 md:pb-16">
      <div className="max-w-[800px] mx-auto flex flex-wrap justify-between items-center max-md:flex-col max-md:text-center max-md:gap-4">
        <div className="flex items-center">
          <span className="text-sm text-[var(--color-text-secondary)] font-normal">
            © {currentYear} LIand 🍵
          </span>
        </div>
        <ul className="flex list-none gap-4 m-0 p-0 items-center">
          {socials.map((social) => (
            <li key={social.platform}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-[var(--color-text-secondary)] hover:text-accent inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <SocialIcon platform={social.platform} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
