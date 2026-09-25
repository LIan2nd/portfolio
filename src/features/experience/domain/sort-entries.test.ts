import { describe, expect, it } from "vitest";
import type { ExperienceEntry } from "./types";
import { sortExperienceEntriesByNewest } from "./sort-entries";

function entry(id: string, dateRange: string): ExperienceEntry {
  return {
    id,
    title: id,
    organization: "Example",
    kind: "work",
    dateRange,
    description: "Example entry",
    highlights: [],
  };
}

describe("experience timeline ordering", () => {
  it("sorts entries by their start date instead of insertion order", () => {
    const entries = [
      entry("old", "Sep 2024 - Jan 2025"),
      entry("newest", "May 2026 - Jul 2026"),
      entry("middle", "Aug 2025 - Sept 2025"),
    ];

    expect(sortExperienceEntriesByNewest(entries).map(({ id }) => id)).toEqual([
      "newest",
      "middle",
      "old",
    ]);
  });

  it("supports Indonesian month names and uses current status as a tie-breaker", () => {
    const entries = [
      entry("future-ended", "Desember 2026 - Januari 2027"),
      entry("ended", "Mei 2025 - Juni 2025"),
      entry("current", "Mei 2025 - Sekarang"),
      entry("older", "Agustus 2024 - September 2024"),
    ];

    expect(sortExperienceEntriesByNewest(entries).map(({ id }) => id)).toEqual([
      "future-ended",
      "current",
      "ended",
      "older",
    ]);
  });

  it("supports ISO and numeric dates while keeping equal dates stable", () => {
    const entries = [
      entry("same-first", "2026-05 - 2026-07"),
      entry("older", "04/2025 - 08/2025"),
      entry("same-second", "2026-05 - Present later"),
      entry("text-before-iso", "Mar 2026 - 2027-01"),
    ];

    expect(sortExperienceEntriesByNewest(entries).map(({ id }) => id)).toEqual([
      "same-second",
      "same-first",
      "text-before-iso",
      "older",
    ]);
  });
});
