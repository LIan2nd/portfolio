export const KNOWLEDGE_GROUPS = {
  about_alfian: {
    title: "Profil & Personal",
    category: "Profile",
    description:
      "Identitas, kontak, skill, bahasa, hobi, pasangan, dan fun fact.",
  },
  current_activity: {
    title: "Karier & Aktivitas",
    category: "Career & Activity",
    description:
      "Aktivitas terkini, kesiapan kerja, preferensi, dan ekspektasi gaji.",
  },
  education_experience: {
    title: "Pendidikan & Pengalaman",
    category: "Education & Experience",
    description:
      "Pendidikan, pengalaman kampus dan riset, publikasi, serta sertifikasi.",
  },
  projects: {
    title: "Proyek",
    category: "Projects",
    description:
      "Deskripsi, fitur, arsitektur, tautan, dan status setiap proyek.",
  },
  "ai-system-prompt": {
    title: "Panduan Perilaku AI",
    category: "AI Behavior",
    description:
      "Aturan gaya bicara, privasi, navigasi, dan penggunaan fakta oleh AI.",
  },
} as const;

export type KnowledgeGroupId = keyof typeof KNOWLEDGE_GROUPS;

export function isKnowledgeGroup(id: string): id is KnowledgeGroupId {
  return Object.hasOwn(KNOWLEDGE_GROUPS, id);
}
