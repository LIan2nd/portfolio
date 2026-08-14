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
} from "lucide-react";
import type { TimelineEntry as TimelineEntryType } from "@/lib/types";

interface TimelineEntryProps {
  entry: TimelineEntryType;
}

function TimelineIcon({ icon }: { icon?: string }) {
  const iconProps = { size: 28, className: "text-accent" };

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
    <li className="flex gap-4 items-center mb-8 last:mb-0">
      <div className="w-14 h-14 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 overflow-hidden p-2">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={entry.title}
            width={40}
            height={40}
            className="w-full h-full object-contain rounded-full"
          />
        ) : (
          <TimelineIcon icon={entry.icon} />
        )}
      </div>
      <div>
        <p className="text-sm opacity-60">{entry.dateRange}</p>
        <p className="text-base font-bold">{entry.title}</p>
        <p className="text-sm opacity-70">
          {entry.subtitle}
          {(entry.link || entry.certificate) && (
            <>
              {" "}
              (
              {entry.link && (
                <>
                  Project:{" "}
                  <a
                    href={entry.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline md:no-underline md:hover:underline active:opacity-75 transition-opacity"
                  >
                    {entry.link.label}
                  </a>
                </>
              )}
              {entry.link && entry.certificate && " | "}
              {entry.certificate && (
                <a
                  href={entry.certificate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline md:no-underline md:hover:underline active:opacity-75 transition-opacity"
                >
                  {entry.certificate.label || "Certificate"}
                </a>
              )}
              )
            </>
          )}
        </p>
      </div>
    </li>
  );
}
