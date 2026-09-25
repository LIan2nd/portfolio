"use client";

import { useState } from "react";
import type { TimelineEntry as TimelineEntryType } from "@/lib/types";
import { TimelineEntry } from "./TimelineEntry";

interface ExperienceSectionProps {
  workEntries: TimelineEntryType[];
  educationEntries: TimelineEntryType[];
}

export function ExperienceSection({
  workEntries,
  educationEntries,
}: ExperienceSectionProps) {
  const [activeTab, setActiveTab] = useState<"work" | "education">("work");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveTab((prev) => (prev === "work" ? "education" : "work"));
    }
  };

  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-10 md:py-14 px-6 text-center">
      <div className="max-w-[800px] mx-auto">
        <span className="text-accent text-xs font-semibold uppercase tracking-widest">Follow my</span>
        <h2 id="experience-heading" className="text-3xl max-sm:text-2xl font-bold mt-1 mb-6">
          Experience
        </h2>
        <div className="text-left w-full max-w-[680px] mx-auto">
          <div
            className="bg-[var(--color-bg-tertiary)] relative flex p-1 rounded-lg mb-4"
            role="tablist"
            aria-label="Experience and education"
            onKeyDown={handleKeyDown}
          >
            {/* Sliding active indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-bg-secondary)] rounded-md shadow-sm transition-transform duration-200 ease-out pointer-events-none ${
                activeTab === "work" ? "left-1 translate-x-0" : "left-1 translate-x-full"
              }`}
            />
            <button
              id="tab-work"
              role="tab"
              aria-controls="panel-work"
              aria-selected={activeTab === "work"}
              tabIndex={activeTab === "work" ? 0 : -1}
              onClick={() => setActiveTab("work")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTab("work");
                }
              }}
              className={`relative z-10 w-1/2 text-center rounded-md cursor-pointer py-1.5 px-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "work"
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Work
            </button>
            <button
              id="tab-education"
              role="tab"
              aria-controls="panel-education"
              aria-selected={activeTab === "education"}
              tabIndex={activeTab === "education" ? 0 : -1}
              onClick={() => setActiveTab("education")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTab("education");
                }
              }}
              className={`relative z-10 w-1/2 text-center rounded-md cursor-pointer py-1.5 px-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "education"
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Education
            </button>
          </div>

          <div
            id={activeTab === "work" ? "panel-work" : "panel-education"}
            role="tabpanel"
            aria-labelledby={activeTab === "work" ? "tab-work" : "tab-education"}
            tabIndex={0}
            className="border border-[var(--color-bg-tertiary)]/60 bg-[var(--color-bg-secondary)]/30 rounded-xl p-6 max-md:p-4 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ul
              key={activeTab}
              aria-label={
                activeTab === "work"
                  ? "Work experience timeline"
                  : "Education timeline"
              }
              className="list-none p-0 m-0 animate-tab-slide"
            >
              {activeTab === "work"
                ? workEntries.map((entry) => (
                    <TimelineEntry
                      key={`${entry.title}-${entry.dateRange}`}
                      entry={entry}
                    />
                  ))
                : educationEntries.map((entry) => (
                    <TimelineEntry
                      key={`${entry.title}-${entry.dateRange}`}
                      entry={entry}
                    />
                  ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
