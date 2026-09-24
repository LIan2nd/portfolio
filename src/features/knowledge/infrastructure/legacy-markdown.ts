import { createHash } from "node:crypto";

export interface MarkdownSection {
  heading: string;
  body: string;
}

export function normalizeHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function contentFingerprint(content: string): string {
  const normalized = content
    .replace(/^-\s+\*\*Kategori:\*\*.*$/gm, "")
    .replace(/^---+\s*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(normalized).digest("hex");
}

export function splitMarkdown(content: string, level = 2): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  let current: MarkdownSection = { heading: "", body: "" };
  const headingPattern = new RegExp(`^#{${level}}\\s+(.+)$`);
  for (const line of content.replace(/^#\s+[^\n]*\n?/, "").split("\n")) {
    const heading = line.match(headingPattern)?.[1];
    if (heading) {
      sections.push(current);
      current = { heading, body: "" };
    } else {
      current.body += `${line}\n`;
    }
  }
  return [...sections, current].map((section) => ({
    ...section,
    body: section.body.replace(/^---+\s*$/gm, "").trim(),
  }));
}

export function splitBehavior(content: string): MarkdownSection[] {
  return splitMarkdown(content, 3).flatMap((section) => {
    if (
      !normalizeHeading(section.heading).includes("aturan utama gaya bicara")
    ) {
      return [section];
    }
    return section.body.split(/\n(?=\d+\. )/).map((rule) => {
      const [heading, ...lines] = rule.split("\n");
      return {
        heading: heading.replace(/^\d+\.\s*/, ""),
        body: lines.join("\n").trim(),
      };
    });
  });
}
