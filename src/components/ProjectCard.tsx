import Image from "next/image";
import {
  ShieldCheck,
  Bot,
  CalendarDays,
  Store,
  Settings,
  ArrowRight,
  Gamepad2,
} from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

function ProjectIcon({ icon }: { icon: string }) {
  const iconProps = { size: 24, className: "text-accent" };

  switch (icon) {
    case "shield-lock":
      return <ShieldCheck {...iconProps} />;
    case "robot":
      return <Bot {...iconProps} />;
    case "calendar-event":
      return <CalendarDays {...iconProps} />;
    case "gamepad":
    case "game":
      return <Gamepad2 {...iconProps} />;
    case "shop":
      return <Store {...iconProps} />;
    default:
      return <Settings {...iconProps} />;
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cardContent = (
    <>
      {/* Screenshot / Banner with dark gradient overlay */}
      <div className="relative w-full aspect-video overflow-hidden bg-[var(--color-bg-tertiary)]/40">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center bg-[#4a3b32]">
            {/* Center horizontal row line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/20" />
            {/* Center vertical column line */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/20" />
            {/* Center intersection indicator */}
            <div className="relative z-10 w-6 h-6 rounded-full border border-white/25 flex items-center justify-center bg-[#4a3b32]/80 backdrop-blur-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        )}
        {/* Dark gradient overlay blending into card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-secondary)] via-[var(--color-bg-secondary)]/30 to-transparent pointer-events-none" />

        {/* Floating icon badge */}
        <div className="absolute top-3 left-3 p-2 rounded-lg bg-[var(--color-bg-primary)]/80 backdrop-blur-md border border-white/10 shadow-sm z-10">
          <ProjectIcon icon={project.icon} />
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 flex flex-col justify-between flex-1 w-full text-left">
        <div className="flex items-start justify-between gap-3 w-full">
          <div>
            <h3 className="text-lg font-bold mb-1 text-[var(--color-text-primary)]">
              {project.title}
            </h3>
            <p className="font-serif text-sm leading-relaxed text-[var(--color-text-primary)] opacity-85">
              {project.description}
            </p>
          </div>
          {project.url && (
            <ArrowRight
              size={20}
              className="text-accent -rotate-45 md:text-[var(--color-text-primary)] md:rotate-0 md:group-hover:text-accent md:group-hover:-rotate-45 md:group-hover:translate-x-0.5 md:group-hover:-translate-y-0.5 transition-all duration-200 ease-out shrink-0 mt-1"
            />
          )}
        </div>
      </div>
    </>
  );

  if (project.url) {
    return (
      <article>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl overflow-hidden bg-[var(--color-bg-secondary)] border border-transparent hover:border-accent/30 active:scale-[0.98] flex flex-col no-underline cursor-pointer transition-all duration-200"
        >
          {cardContent}
        </a>
      </article>
    );
  }

  return (
    <article className="rounded-xl overflow-hidden bg-[var(--color-bg-secondary)] flex flex-col cursor-not-allowed opacity-50 border border-transparent">
      {cardContent}
    </article>
  );
}
