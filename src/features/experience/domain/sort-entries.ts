import type { ExperienceEntry } from "./types";

const MONTHS: Readonly<Record<string, number>> = {
  jan: 1,
  january: 1,
  januari: 1,
  feb: 2,
  february: 2,
  februari: 2,
  mar: 3,
  march: 3,
  maret: 3,
  apr: 4,
  april: 4,
  may: 5,
  mei: 5,
  jun: 6,
  june: 6,
  juni: 6,
  jul: 7,
  july: 7,
  juli: 7,
  aug: 8,
  august: 8,
  agu: 8,
  agustus: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  okt: 10,
  oktober: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
  des: 12,
  desember: 12,
};

const CURRENT_PERIOD_PATTERN = /\b(present|current|now|sekarang|saat ini)\b/i;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const ISO_DATE_PATTERN = /\b((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])\b/;
const NUMERIC_DATE_PATTERN = /\b(0?[1-9]|1[0-2])[-/.]((?:19|20)\d{2})\b/;
const MONTH_DATE_PATTERN = new RegExp(
  `\\b(${Object.keys(MONTHS).join("|")})\\.?\\s+((?:19|20)\\d{2})\\b`,
  "i",
);

interface TimelinePosition {
  current: boolean;
  start: number;
}

interface DateCandidate {
  index: number;
  value: number;
}

function parseTimelinePosition(dateRange: string): TimelinePosition {
  const normalized = dateRange.trim().toLowerCase();
  const current = CURRENT_PERIOD_PATTERN.test(normalized);
  const isoDate = normalized.match(ISO_DATE_PATTERN);
  const numericDate = normalized.match(NUMERIC_DATE_PATTERN);
  const monthDate = normalized.match(MONTH_DATE_PATTERN);
  const year = normalized.match(YEAR_PATTERN);

  const candidates: DateCandidate[] = [];
  if (isoDate) {
    candidates.push({
      index: isoDate.index ?? 0,
      value: Number(isoDate[1]) * 12 + Number(isoDate[2]),
    });
  }
  if (numericDate) {
    candidates.push({
      index: numericDate.index ?? 0,
      value: Number(numericDate[2]) * 12 + Number(numericDate[1]),
    });
  }
  if (monthDate) {
    candidates.push({
      index: monthDate.index ?? 0,
      value:
        Number(monthDate[2]) * 12 + MONTHS[monthDate[1].toLowerCase()],
    });
  }
  if (year) {
    candidates.push({
      index: year.index ?? 0,
      value: Number(year[0]) * 12 + (current ? 12 : 0),
    });
  }

  const start = candidates.sort((left, right) => left.index - right.index)[0]
    ?.value ?? Number.NEGATIVE_INFINITY;

  return {
    current,
    start,
  };
}

export function sortExperienceEntriesByNewest(
  entries: readonly ExperienceEntry[],
): ExperienceEntry[] {
  return entries
    .map((entry, index) => ({
      entry,
      index,
      position: parseTimelinePosition(entry.dateRange),
    }))
    .sort((left, right) => {
      return (
        right.position.start - left.position.start ||
        Number(right.position.current) - Number(left.position.current) ||
        left.index - right.index
      );
    })
    .map(({ entry }) => entry);
}
