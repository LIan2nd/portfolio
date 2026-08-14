import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ExperienceSection } from "@/components/ExperienceSection";
import { TimelineEntry } from "@/components/TimelineEntry";
import { WORK_ENTRIES, EDUCATION_ENTRIES } from "@/lib/data";
import type { TimelineEntry as TimelineEntryType } from "@/lib/types";

describe("ExperienceSection & TimelineEntry", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders Work tab by default and switches to Education tab on click", async () => {
    const user = userEvent.setup();
    render(
      <ExperienceSection
        workEntries={WORK_ENTRIES}
        educationEntries={EDUCATION_ENTRIES}
      />
    );

    const workTab = screen.getByRole("tab", { name: /work/i });
    const eduTab = screen.getByRole("tab", { name: /education/i });

    expect(workTab).toHaveAttribute("aria-selected", "true");
    expect(eduTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Frontend & Blockchain Researcher")).toBeInTheDocument();

    await user.click(eduTab);
    expect(workTab).toHaveAttribute("aria-selected", "false");
    expect(eduTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/Teknik Informatika/i)).toBeInTheDocument();
  });

  it("supports keyboard navigation with arrow keys", () => {
    render(
      <ExperienceSection
        workEntries={WORK_ENTRIES}
        educationEntries={EDUCATION_ENTRIES}
      />
    );

    const tablist = screen.getByRole("tablist");
    const workTab = screen.getByRole("tab", { name: /work/i });
    const eduTab = screen.getByRole("tab", { name: /education/i });

    expect(workTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(eduTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(workTab).toHaveAttribute("aria-selected", "true");
  });

  // Feature: portfolio-nextjs-migration, Property 4: Tab switching exclusivity
  it("Property 4: exactly one timeline is visible at any time", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom<"work" | "education">("work", "education"), {
          minLength: 1,
          maxLength: 10,
        }),
        (tabSelections) => {
          cleanup();
          render(
            <ExperienceSection
              workEntries={WORK_ENTRIES}
              educationEntries={EDUCATION_ENTRIES}
            />
          );

          const workTab = screen.getByRole("tab", { name: /work/i });
          const eduTab = screen.getByRole("tab", { name: /education/i });

          for (const target of tabSelections) {
            if (target === "education") {
              fireEvent.click(eduTab);
              expect(eduTab).toHaveAttribute("aria-selected", "true");
              expect(workTab).toHaveAttribute("aria-selected", "false");
              expect(screen.queryByText(/Teknik Informatika/i)).toBeInTheDocument();
              expect(
                screen.queryByText("Frontend & Blockchain Researcher")
              ).not.toBeInTheDocument();
            } else {
              fireEvent.click(workTab);
              expect(workTab).toHaveAttribute("aria-selected", "true");
              expect(eduTab).toHaveAttribute("aria-selected", "false");
              expect(
                screen.queryByText("Frontend & Blockchain Researcher")
              ).toBeInTheDocument();
              expect(screen.queryByText(/Teknik Informatika/i)).not.toBeInTheDocument();
            }
          }

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: portfolio-nextjs-migration, Property 5: Timeline entry completeness
  it("Property 5: renders all fields of any TimelineEntry object", () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom("code", "terminal", "school", "graduation-cap", "microscope"),
          dateRange: fc.string({ minLength: 2, maxLength: 30 }),
          title: fc.string({ minLength: 2, maxLength: 40 }),
          subtitle: fc.string({ minLength: 2, maxLength: 40 }),
          link: fc.option(
            fc.record({
              url: fc.webUrl(),
              label: fc.stringMatching(/^[A-Za-z0-9]{3,15}$/),
            }),
            { nil: undefined }
          ),
        }),
        (entry: TimelineEntryType) => {
          cleanup();
          const { container } = render(<TimelineEntry entry={entry} />);

          const dateEl = container.querySelector("p.text-sm.opacity-60");
          expect(dateEl?.textContent).toBe(entry.dateRange);

          const titleEl = container.querySelector("p.text-base.font-bold");
          expect(titleEl?.textContent).toBe(entry.title);

          const subtitleEl = container.querySelector("p.text-sm.opacity-70");
          expect(subtitleEl?.textContent).toContain(entry.subtitle);

          if (entry.link) {
            const linkEl = container.querySelector("a");
            expect(linkEl?.textContent).toBe(entry.link.label);
            expect(linkEl).toHaveAttribute("href", entry.link.url);
          }

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
