import type { Skill, PersonalDetail, SocialLink, TimelineEntry, Project, Certification, NavLink } from "./types";

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Project", href: "#project" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export const SKILLS: Skill[] = [
  { name: "JavaScript" },
  { name: "TypeScript" },
  { name: "PHP" },
  { name: "Python" },
  { name: "Next.js" },
  { name: "React" },
  { name: "Laravel" },
  { name: "Flask" },
  { name: "MySQL" },
  { name: "PostgreSQL" },
  { name: "MongoDB" },
  { name: "TailwindCSS" },
  { name: "Git" },
  { name: "Blockchain" },
];

export const PERSONAL_DETAILS: PersonalDetail[] = [
  { label: "Name", value: "Alfian Nur Usyaid" },
  { label: "Experience", value: "2+ Years (Coding)" },
  { label: "Location", value: "Bogor, Indonesia" },
  { label: "Focus", value: "Web & Web3" },
  { label: "Availability", value: "Open for Work" },
  { label: "Email", value: "alfiannurusyaid19@gmail.com" },
];

export const SOCIALS: SocialLink[] = [
  { platform: "instagram", url: "https://instagram.com/lforthissielu/", label: "Instagram" },
  { platform: "github", url: "https://github.com/LIan2nd/", label: "GitHub" },
  { platform: "linkedin", url: "https://linkedin.com/in/alfian-nur-usyaid/", label: "LinkedIn" },
];

export const WORK_ENTRIES: TimelineEntry[] = [
  {
    logo: "/img/sttnf.png",
    dateRange: "May 2026 - Jul 2026",
    title: "Teaching Assistant (Data Structures & Algorithms)",
    subtitle: "STT Terpadu Nurul Fikri",
    description: [
      "Mentored 40+ undergraduate students in core Data Structures & Algorithms concepts (Tree, Graph, Sorting, Big-O analysis).",
      "Conducted weekly lab hands-on practicum and assisted in grading algorithmic assignments.",
    ],
    certificate: {
      url: "/file/work/Asisten Dosen Struktur Data & Algoritma 2025-2.jpg",
      label: "Certificate",
    },
  },
  {
    logo: "/img/sttnf.png",
    dateRange: "May 2026 - Jul 2026",
    title: "Teaching Assistant (Database)",
    subtitle: "STT Terpadu Nurul Fikri",
    description: [
      "Guided students through Relational Database Management Systems (RDBMS), SQL query optimization, and ERD schema design.",
      "Facilitated laboratory sessions utilizing PostgreSQL and MySQL databases.",
    ],
    certificate: {
      url: "/file/work/Asisten Dosen Basis Data 2025-2.jpg",
      label: "Certificate",
    },
  },
  {
    logo: "/img/sttnf.png",
    dateRange: "Aug 2025 - Sept 2025",
    title: "Frontend & Blockchain Researcher",
    subtitle: "Joint Research",
    description: [
      "Researched and built decentralized file storage architectures utilizing Next.js, Wagmi, and IPFS.",
      "Integrated Solidity smart contracts for cryptographically verified proof-of-storage.",
    ],
    link: { url: "https://digiarc.vercel.app", label: "DigiArc Project" },
  },
  {
    logo: "/img/sttnf.png",
    dateRange: "Feb 2025 - Jul 2025",
    title: "Fullstack Developer",
    subtitle: "Academic Research Project",
    description: [
      "Engineered ESAO automated essay grading platform with decoupled architecture (Next.js frontend & Flask Python AI backend).",
      "Implemented NLP scoring pipeline with real-time feedback and responsive interactive dashboard.",
    ],
    link: { url: "https://esao.nurulfikri.ac.id", label: "ESAO System" },
    certificate: {
      url: "/file/work/Alfian Nur Usyaid - Sertifikat Magang Riset 2024-2.pdf",
      label: "Research Certificate",
    },
  },
  {
    logo: "/img/sttnf.png",
    dateRange: "Sep 2024 - Jan 2025",
    title: "Lab Teaching Assistant (Backend)",
    subtitle: "STT Terpadu Nurul Fikri",
    description: [
      "Taught backend web architecture, RESTful API design, MVC patterns, and ORM integrations with PHP (Laravel).",
      "Provided one-on-one debugging sessions and evaluated student code submissions.",
    ],
    certificate: {
      url: "/file/work/Asisten Dosen Backend 2024-1.jpg",
      label: "Certificate",
    },
  },
];

export const EDUCATION_ENTRIES: TimelineEntry[] = [
  {
    logo: "/img/sttnf.png",
    dateRange: "2022 - 2026",
    title: "STT Terpadu Nurul Fikri",
    subtitle: "Bachelor of Computer Science (S.Kom) — Teknik Informatika",
    description: [
      "Graduated with Honors (Cumlaude, GPA 3.94 / 4.00).",
      "Specialized in Software Engineering, Fullstack Web Development, and Distributed Systems.",
    ],
  },
  {
    logo: "/img/logo-ma.png",
    dateRange: "2019 - 2022",
    title: "MA Sirojul Athfal 02",
    subtitle: "Social Sciences (IPS)",
    description: [
      "Active in student organization leadership and extracurricular academic activities.",
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    icon: "shield-lock",
    title: "DigiArc (Web3 Storage)",
    description:
      "Decentralized storage platform inspired by Google Drive. Built with Next.js, Wagmi, and Smart Contracts (Solidity) for data integrity.",
    url: "https://digiarc.vercel.app",
    image: "/img/projects/digiarc.png",
  },
  {
    icon: "robot",
    title: "ESAO (AI Grading)",
    description:
      "Automated essay grading system. Decoupled architecture using Flask (Python) for AI processing and Next.js for the client-side.",
    url: "https://esao.nurulfikri.ac.id",
    image: "/img/projects/esao.png",
  },
  {
    icon: "calendar-event",
    title: "Event Management System",
    description:
      "Comprehensive event registration platform built with Laravel (MVC). Features secure authentication, role management, and CRUD operations.",
    url: "https://github.com/LIan2nd/sistem-pendaftaran-event",
    image: "/img/projects/sistem-pendaftaran-event.png",
  },
  {
    icon: "gamepad",
    title: "Tetrisn't (Reverse Puzzle Game)",
    description:
      "Strategic puzzle game built with Unity (C#). Inverts classic mechanics where perfection is failure—lines only clear when left with exactly one gap.",
    url: "https://github.com/LIan2nd/Tetrisn-t",
    image: "/img/projects/tetrisn't.png",
  },
  // {
  //   icon: "shop",
  //   title: "AkuJualin (Omnichannel)",
  //   description:
  //     "E-commerce integrator for Shopee & TikTok Shop using T3 Stack (Next.js, tRPC, Prisma) with full type-safety.",
  // },
  // {
  //   icon: "gear",
  //   title: "Coming Soon",
  //   description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  // },
  // {
  //   icon: "gear",
  //   title: "Coming Soon",
  //   description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  // },
];

export const CERTIFICATIONS: Certification[] = [
  {
    title: "The Complete Full-Stack Web Development Bootcamp",
    issuer: "Udemy",
    date: "Jun 2026",
    credentialId: "UC-8d1a2b88-45c5-49a4-9404-7b8b8e988a9d",
    credentialUrl:
      "/file/certifications/The Complete Full-Stack Web Development Bootcamp - Alfian Nur Usyaid.pdf",
    skills: ["Fullstack Web Development", "Node.js", "React", "PostgreSQL", "Motoko"],
  },
  {
    title: "Complete Web Development Course",
    issuer: "Udemy",
    date: "Jul 2026",
    credentialId: "UC-c25d74f6-2110-43c6-8898-d2e070ba5b42",
    credentialUrl:
      "/file/certifications/Complete Web Development Course - Alfian Nur Usyaid.pdf",
    skills: ["Fullstack Web Development", "JavaScript", "ExpressJs", "NextJs", "MongoDB", "Docker"],
  },
  {
    title: "Mini Class Next JS Real Project",
    issuer: "Dunia Coding",
    date: "Sep 2025",
    credentialUrl:
      "/file/certifications/Dunia Coding_Sertifikat Mini Class - Alfian Nur Usyaid.pdf",
    skills: ["Next.js", "TypeScript", "TailwindCSS"],
  },
  {
    title: "Code Generations and Optimization (Wave 5)",
    issuer: "IBM SkillsBuild & Hacktiv8",
    date: "Jul 2025",
    credentialUrl:
      "/file/certifications/Sertifikat IBM Wave 5 - Alfian Nur Usyaid.pdf",
    skills: ["Code Generation", "Code Optimization", "AI"],
  },
  {
    title: "Coding Camp - Software Engineering",
    issuer: "RevoU",
    date: "Jul 2025",
    credentialId: "CCSE070725-01-1-00131",
    credentialUrl:
      "/file/certifications/SECC_alfiannurusyaid19@gmail.com_CCSE070725-01-1-00131.pdf",
    skills: ["Software Engineering", "Web Development"],
  },
  {
    title: "Xpresso 4 - UI/UX Design And Development",
    issuer: "LearningX",
    date: "Dec 2024",
    credentialUrl:
      "/file/certifications/Xpresso 4 - UIUX Design And Development.pdf",
    skills: ["UI/UX Design", "Web Development"],
  },
  {
    title: "MBKM Course Batch 7: Full Stack Web Development",
    issuer: "LearningX",
    date: "Nov 2024",
    credentialUrl:
      "/file/certifications/MBKM Course Batch 7 Full Stack Web Development.pdf",
    skills: ["Full Stack", "React", "Node.js"],
  },
  {
    title: "Belajar React JS dari Dasar hingga Siap Deployment",
    issuer: "Dunia Coding",
    date: "2024",
    credentialId: "C-C24-0013",
    credentialUrl:
      "/file/certifications/Dunia Coding_Sertifikat React - Alfian Nur Usyaid.pdf",
    skills: ["React", "JavaScript", "Deployment"],
  },
];

export const CONTACT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzWscwvmfPHsrD0PFYmytr3Hr3UHTo46rhpMQ6vB_-aPoSeKnm37EYNEP2OAshRNfM-Dw/exec";
