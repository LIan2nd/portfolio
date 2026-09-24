import type { KnowledgeDocument } from "../domain/types";
import {
  isKnowledgeGroup,
  KNOWLEDGE_GROUPS,
  type KnowledgeGroupId,
} from "../domain/groups";
import fingerprints from "./legacy-fingerprints.json";
import {
  contentFingerprint,
  normalizeHeading,
  splitBehavior,
  splitMarkdown,
  type MarkdownSection,
} from "./legacy-markdown";

export const KNOWLEDGE_SCHEMA_VERSION = 2;

export interface PersistedKnowledgeDocument extends KnowledgeDocument {
  knowledgeSchemaVersion?: number;
}

interface KnowledgeFragment extends MarkdownSection {
  group: KnowledgeGroupId;
  mergeFields?: boolean;
}

const PROJECT_NAMES: Record<string, string> = {
  chicken_yasaka: "Chicken Yasaka",
  digiarc: "DigiArc",
  esao_research: "ESAO (Essay Analytic Online)",
  hrd_api: "HRD RESTful API",
  l_movie: "L-Movie",
  leath_notes: "Leath Notes",
  roadsense: "RoadSense",
};

const SECTION_ROUTES: [RegExp, KnowledgeGroupId, string][] = [
  [
    /ringkasan akademik|riwayat akademik|pendidikan pencapaianku/,
    "education_experience",
    "Riwayat Akademik",
  ],
  [
    /pengalaman asisten dosen/,
    "education_experience",
    "Pengalaman Asisten Dosen (Teaching Assistant)",
  ],
  [
    /kolaborasi riset/,
    "education_experience",
    "Kolaborasi Riset Akademik & Penelitian Dosen",
  ],
  [
    /program kampus merdeka/,
    "education_experience",
    "Program Kampus Merdeka (MSIB Batch 7)",
  ],
  [
    /kepanitiaan kehidupan kampus/,
    "education_experience",
    "Kepanitiaan & Kehidupan Kampus",
  ],
  [
    /publikasi jurnal/,
    "education_experience",
    "Publikasi Jurnal Ilmiah (MIND Journal)",
  ],
  [/sertifikasiku/, "education_experience", "Sertifikasi"],
  [/expected salary/, "current_activity", "Expected Salary & Rate"],
  [
    /ketersediaan preferensi kerja|kesiapan kerja preferensi/,
    "current_activity",
    "Kesiapan Kerja & Preferensi",
  ],
  [/status terkini/, "current_activity", "Status Terkini (Saat Ini)"],
  [
    /pengalaman kerja risetku/,
    "education_experience",
    "Kolaborasi Riset Akademik & Penelitian Dosen",
  ],
  [/proyek unggulanku/, "projects", "Proyek Tambahan"],
  [/tech setup|skill tech stack/, "about_alfian", "Skill, Prinsip & Setup"],
  [/personal fun facts/, "about_alfian", "Personal & Fun Facts"],
  [
    /life partner pasangan hidup/,
    "about_alfian",
    "Life Partner / Pasangan Hidup (Cewekku)",
  ],
  [/data pribadi|kontak sosial media/, "about_alfian", "Identitas & Kontak"],
];

interface LegacyBaseline {
  [heading: string]: string | string[] | undefined;
  $blocks?: string[];
  $lines?: string[];
}

function baselineFor(id: string): LegacyBaseline {
  return (fingerprints as Record<string, LegacyBaseline>)[id] ?? {};
}

function isBundledSection(id: string, section: MarkdownSection): boolean {
  const baseline = baselineFor(id);
  return (
    baseline?.[normalizeHeading(section.heading)] ===
    contentFingerprint(section.body)
  );
}

function changedBody(id: string, body: string): string {
  const baseline = baselineFor(id);
  return splitBulletBlocks(body)
    .flatMap((block) => {
      if (baseline.$blocks?.includes(contentFingerprint(block))) return [];
      if (/^[-•]|^\d+\./.test(block)) return [block];
      return block
        .split("\n")
        .filter((line) => !baseline.$lines?.includes(contentFingerprint(line)));
    })
    .join("\n")
    .trim();
}

function defaultGroup(id: string): KnowledgeGroupId {
  if (id === "campus_experience" || id === "thesis_and_education")
    return "education_experience";
  if (isKnowledgeGroup(id)) return id;
  return "about_alfian";
}

function routeSection(id: string, section: MarkdownSection): KnowledgeFragment {
  if (id === "about_alfian" && !section.heading) {
    return {
      ...section,
      group: "about_alfian",
      heading: "Identitas & Kontak",
      mergeFields: true,
    };
  }
  const normalized = normalizeHeading(section.heading);
  const route = SECTION_ROUTES.find(([pattern]) => pattern.test(normalized));
  if (route)
    return {
      ...section,
      group: route[1],
      heading: route[2],
      mergeFields: true,
    };
  if (/instruksi|aturan|privasi/.test(normalized)) {
    return { ...section, group: "ai-system-prompt" };
  }
  return { ...section, group: defaultGroup(id) };
}

function cleanLegacyBody(body: string): string {
  return body
    .replace(/^-\s+\*\*Kategori:\*\*.*$/gm, "")
    .replace(/\*?\(?Lihat detail[^\n]*?`[^`]+\.md`[^\n]*/gi, "")
    .trim();
}

function splitBulletBlocks(body: string): string[] {
  return body
    .split(/\n(?=- )/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function splitMixedSection(
  id: string,
  section: MarkdownSection,
): KnowledgeFragment[] {
  const main = routeSection(id, section);
  const extracted: KnowledgeFragment[] = [];
  const remaining = splitBulletBlocks(main.body).filter((block) => {
    let destination: [KnowledgeGroupId, string] | undefined;
    if (/^- \*\*(Pendidikan|Gelar & Lulusan):/i.test(block)) {
      destination = ["education_experience", "Riwayat Akademik"];
    } else if (/^- \*\*Kesiapan Karir:/i.test(block)) {
      destination = ["current_activity", "Kesiapan Kerja & Preferensi"];
    } else if (/^- \*\*Kemampuan Bahasa/i.test(block)) {
      destination = ["about_alfian", "Bahasa"];
    } else if (/^- \*\*Prinsip Rekayasa/i.test(block)) {
      destination = ["about_alfian", "Skill, Prinsip & Setup"];
    } else if (/^- \*\*Cita-Cita/i.test(block)) {
      destination = ["current_activity", "Cita-Cita / Impian Karir"];
    } else if (/^- \*\*(Instruksi|Prinsip Kesetiaan)/i.test(block)) {
      destination = ["ai-system-prompt", section.heading];
    }
    if (
      !destination ||
      (destination[0] === main.group && destination[1] === main.heading)
    )
      return true;
    extracted.push({
      group: destination[0],
      heading: destination[1],
      body: block,
      mergeFields: true,
    });
    return false;
  });
  return [{ ...main, body: remaining.join("\n") }, ...extracted].filter(
    ({ body }) => body.trim(),
  );
}

function projectStatusFragments(section: MarkdownSection): KnowledgeFragment[] {
  return splitBulletBlocks(section.body).map((body) => {
    const normalized = normalizeHeading(body);
    const project = Object.entries(PROJECT_NAMES).find(
      ([id, name]) =>
        normalized.includes(normalizeHeading(name.split(" (")[0])) ||
        normalized.includes(id.replace(/_/g, " ")),
    );
    if (project) {
      return {
        group: "projects",
        heading: `${project[0]} — ${project[1]}`,
        body: body
          .replace(/^- \*\*[^*]+\*\*\s*/, "- **Status:** ")
          .replace(/\s*[—–]\s*\*?Lihat detail[\s\S]*/i, "")
          .trim(),
        mergeFields: true,
      };
    }
    return {
      group: "education_experience",
      heading: section.heading,
      body,
      mergeFields: true,
    };
  });
}

function legacyFragments(document: KnowledgeDocument): KnowledgeFragment[] {
  const projectName = PROJECT_NAMES[document.id];
  if (projectName) {
    const body = document.content.replace(/^#\s+[^\n]*\n?/, "").trim();
    if (isBundledSection(document.id, { heading: "*", body })) return [];
    const sections = splitMarkdown(document.content);
    const contentChanged = sections.some(
      (section) => section.heading && !isBundledSection(document.id, section),
    );
    const projectBody = contentChanged
      ? body
          .split("\n")
          .filter(
            (line) =>
              !/^[- ]*\*\*(Status|Konteks|Role Alfian|Bukti Sertifikat):/.test(
                line,
              ) ||
              !baselineFor(document.id).$lines?.includes(
                contentFingerprint(line),
              ),
          )
          .join("\n")
      : changedBody(document.id, sections[0].body);
    return [
      {
        group: "projects",
        heading: `${document.id} — ${projectName}`,
        body: cleanLegacyBody(projectBody).replace(/^(#{2,5}) /gm, "#$1 "),
        mergeFields: !contentChanged,
      },
    ];
  }
  const sections =
    document.id === "ai-system-prompt" && /###\s+/.test(document.content)
      ? splitBehavior(document.content)
      : splitMarkdown(document.content);
  return sections.flatMap((section) => {
    if (!section.body || isBundledSection(document.id, section)) return [];
    const cleaned = {
      ...section,
      body: cleanLegacyBody(changedBody(document.id, section.body)),
    };
    if (!cleaned.body) return [];
    if (normalizeHeading(section.heading).includes("status lifecycle proyek")) {
      return projectStatusFragments(cleaned);
    }
    return splitMixedSection(document.id, cleaned);
  });
}

const FIELD_ALIASES: [RegExp, string][] = [
  [/^(panggilan|nama panggilan)\b/, "panggilan"],
  [/^(nama lengkap|nama)\b/, "nama"],
  [/^(website portofolio|portofolio)\b/, "portofolio"],
  [/^(full time|ekspektasi gaji)\b/, "full time"],
  [/^(freelance|project based)\b/, "freelance"],
  [/^(notice period|ketersediaan|kesiapan karir)\b/, "ketersediaan"],
  [/^(preferensi lokasi kerja|model kerja)\b/, "model kerja"],
  [/^(pendidikan|gelar lulusan|stt terpadu nurul fikri)\b/, "pendidikan"],
  [/^(prinsip rekayasa)\b/, "prinsip rekayasa"],
  [/^(live url|live app|live)\b/, "live"],
  [/^(repository github|repository)\b/, "repository"],
  [/^(tech stack|stack)\b/, "stack"],
  [/^(workflow devops|workflow tools)\b/, "workflow"],
];

function fieldKey(block: string): string | undefined {
  const label = block.match(/^[-•]\s+\*\*([^*]+)\*\*/)?.[1];
  if (!label) return undefined;
  const normalized = normalizeHeading(label);
  return (
    FIELD_ALIASES.find(([pattern]) => pattern.test(normalized))?.[1] ??
    normalized
  );
}

function mergeBulletFields(current: string, incoming: string): string {
  const blocks = current
    .split(/\n(?=- |#{3,} )/)
    .map((block) => block.trim())
    .filter(Boolean);
  for (const block of incoming
    .split(/\n(?=- |#{3,} )/)
    .map((block) => block.trim())
    .filter(Boolean)) {
    const key = fieldKey(block);
    const index = key
      ? blocks.findIndex((candidate) => fieldKey(candidate) === key)
      : -1;
    if (index === -1) {
      if (!blocks.includes(block)) blocks.push(block);
    } else blocks[index] = block;
  }
  return blocks.join("\n");
}

function replaceSection(content: string, fragment: KnowledgeFragment): string {
  const title = content.match(/^#\s+[^\n]*/)?.[0] ?? "";
  const sections = splitMarkdown(content);
  const key = normalizeHeading(fragment.heading);
  const index = sections.findIndex(
    ({ heading }) => normalizeHeading(heading) === key,
  );
  if (index === -1) sections.push(fragment);
  else {
    const current = sections[index].body;
    const status = current.match(/^- \*\*Status:\*\*.*$/m)?.[0];
    let body = fragment.mergeFields
      ? mergeBulletFields(current, fragment.body)
      : fragment.body;
    if (
      fragment.group === "projects" &&
      status &&
      !/^- \*\*Status:\*\*/m.test(body)
    ) {
      body = `${status}\n${body}`;
    }
    sections[index] = { ...fragment, body };
  }
  return [
    title,
    ...sections.map(({ heading, body }) =>
      heading ? `## ${heading}\n${body}` : body,
    ),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function mergeFragment(
  document: KnowledgeDocument,
  fragment: KnowledgeFragment,
  updatedAt: string,
): KnowledgeDocument {
  return {
    ...document,
    content: replaceSection(document.content, fragment),
    updatedAt,
  };
}

export function consolidateKnowledgeDocuments(
  seeds: readonly KnowledgeDocument[],
  stored: readonly PersistedKnowledgeDocument[],
): KnowledgeDocument[] {
  const documents = new Map(seeds.map((document) => [document.id, document]));
  const authoritative = new Map<string, KnowledgeDocument>();
  const legacy = [...stored].sort(
    (left, right) =>
      left.updatedAt.localeCompare(right.updatedAt) ||
      left.id.localeCompare(right.id),
  );
  for (const document of legacy) {
    const canonical = isKnowledgeGroup(document.id);
    if (
      !Object.hasOwn(fingerprints, document.id) ||
      (canonical &&
        document.knowledgeSchemaVersion === KNOWLEDGE_SCHEMA_VERSION) ||
      (canonical && !/^#{2,3}\s/m.test(document.content))
    ) {
      authoritative.set(document.id, document);
      continue;
    }
    for (const fragment of legacyFragments(document)) {
      const current = documents.get(fragment.group) ?? {
        id: fragment.group,
        ...KNOWLEDGE_GROUPS[fragment.group],
        content: `# ${KNOWLEDGE_GROUPS[fragment.group].title}`,
        updatedAt: document.updatedAt,
      };
      documents.set(
        fragment.group,
        mergeFragment(current, fragment, document.updatedAt),
      );
    }
  }
  for (const [id, document] of authoritative) {
    const publicDocument: KnowledgeDocument = {
      id: document.id,
      title: document.title,
      description: document.description,
      category: document.category,
      content: document.content,
      updatedAt: document.updatedAt,
    };
    documents.set(
      id,
      isKnowledgeGroup(id)
        ? { ...publicDocument, category: KNOWLEDGE_GROUPS[id].category }
        : publicDocument,
    );
  }
  return [...documents.values()];
}
