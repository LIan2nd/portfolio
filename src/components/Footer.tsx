import type { SocialLink } from "@/lib/types";
import { InstagramIcon, GithubIcon, LinkedinIcon } from "./icons/SocialIcons";

interface FooterProps {
  socials: SocialLink[];
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "instagram":
      return <InstagramIcon size={20} />;
    case "github":
      return <GithubIcon size={20} />;
    case "linkedin":
      return <LinkedinIcon size={20} />;
    default:
      return <GithubIcon size={20} />;
  }
}

export function Footer({ socials }: FooterProps) {
  return (
    <footer className="max-w-[800px] mx-auto flex flex-wrap justify-between items-center py-6 mb-3 mt-12 px-6 max-md:flex-col max-md:text-center max-md:gap-4">
      <div className="flex items-center">
        <span className="text-[var(--color-text-primary)]">© 2025 LIand 🍵</span>
      </div>
      <ul className="flex list-none gap-4 m-0 p-0">
        {socials.map((social) => (
          <li key={social.platform}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-accent min-w-[24px] min-h-[24px] inline-flex items-center justify-center hover:opacity-75 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <SocialIcon platform={social.platform} />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
