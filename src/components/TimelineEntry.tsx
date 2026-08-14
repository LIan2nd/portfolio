import Image from "next/image";
import {
  Microscope,
  Code,
  Terminal,
  GraduationCap,
  School,
  Database,
  Binary,
  BookOpen,
  ExternalLink,
  FileText,
} from "lucide-react";
import type { TimelineEntry as TimelineEntryType } from "@/lib/types";

interface TimelineEntryProps {
  entry: TimelineEntryType;
}

function TimelineIcon({ icon }: { icon?: string }) {
  const iconProps = { size: 24, className: "text-accent" };

  switch (icon) {
    case "microscope":
      return <Microscope {...iconProps} />;
    case "code":
      return <Code {...iconProps} />;
    case "terminal":
      return <Terminal {...iconProps} />;
    case "graduation-cap":
      return <GraduationCap {...iconProps} />;
    case "school":
      return <School {...iconProps} />;
    case "database":
      return <Database {...iconProps} />;
    case "binary":
      return <Binary {...iconProps} />;
    case "book-open":
      return <BookOpen {...iconProps} />;
    default:
      return <Code {...iconProps} />;
  }
}

function isImagePath(src?: string): boolean {
  if (!src) return false;
  return (
    src.startsWith("/") ||
    src.startsWith("http") ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(src)
  );
}

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const imageSrc = isImagePath(entry.logo)
    ? entry.logo
    : isImagePath(entry.icon)
    ? entry.icon
    : null;

  return (
    <li className="flex gap-4 items-start mb-8 last:mb-0 text-left">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 overflow-hidden p-2 mt-0.5 shadow-xs">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={entry.title}
            width={36}
            height={36}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <TimelineIcon icon={entry.icon} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-snug">
            {entry.title}
          </h3>
          <span className="text-xs font-medium text-[var(--color-text-secondary)] shrink-0 opacity-80 sm:text-right">
            {entry.dateRange}
          </span>
        </div>

        <p className="text-sm font-medium text-accent mt-0.5">
          {entry.subtitle}
        </p>

        {entry.description && entry.description.length > 0 && (
          <ul className="mt-2.5 space-y-1 text-sm font-serif text-[var(--color-text-primary)]/85 leading-relaxed list-none p-0">
            {entry.description.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-accent select-none mt-0.5 text-xs shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {(entry.link || entry.certificate) && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {entry.link && (
              <a
                href={entry.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--color-bg-secondary)] hover:bg-accent text-[var(--color-text-primary)] hover:text-white border border-[var(--color-bg-tertiary)] hover:border-accent transition-all duration-200 active:scale-95 shadow-xs no-underline"
              >
                <ExternalLink size={12} className="shrink-0" />
                <span>{entry.link.label}</span>
              </a>
            )}
            {entry.certificate && (
              <a
                href={entry.certificate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--color-bg-secondary)] hover:bg-accent text-[var(--color-text-primary)] hover:text-white border border-[var(--color-bg-tertiary)] hover:border-accent transition-all duration-200 active:scale-95 shadow-xs no-underline"
              >
                <FileText size={12} className="shrink-0 text-accent" />
                <span>{entry.certificate.label || "Certificate"}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
