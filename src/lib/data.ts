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
  { label: "Email", value: "alfiannurusyaid19[at]gmail.com", isEmail: true },
];

export const SOCIALS: SocialLink[] = [
  { platform: "instagram", url: "https://www.instagram.com/wonder__liand", label: "Instagram" },
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
      "Mentored students in core Data Structures & Algorithms concepts (Tree, Graph, Sorting, Big-O analysis).",
      "Conducted weekly lab hands-on practicum and assisted in grading algorithmic assignments.",
      "Provide one-on-one technical assistance and guidance to students in data structures and algorithms concepts, helping them troubleshoot code and understand complex database logic.",
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
      "Facilitated laboratory sessions utilizing MySQL databases.",
      "Provide one-on-one technical assistance and guidance to students in database concepts, helping them troubleshoot code and understand complex database logic.",
      "Assisted in grading assignments and provided constructive feedback to help students improve their database skills.",
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
      "Engineered ESAO (Essay Analytic Online), an AI-driven automated essay grading platform empowering lecturers to assess essay exams in seconds.",
      "Architected decoupled fullstack system using Next.js for the responsive analytics dashboard and Flask (Python) with LangChain for rubric-based and automated student feedback.",
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
      "Provide one-on-one technical assistance and guidance to students in backend development concepts, helping them troubleshoot code and understand complex server-side logic.",
      "Assisted in grading assignments and provided constructive feedback to help students improve their backend skills.",
    ],
    certificate: {
      url: "/file/work/Asisten Dosen Backend 2024-1.jpg",
      label: "Certificate",
    },
  },
  {
    logo: "/img/learning-x-academy.png",
    dateRange: "Sep 2024 - Dec 2024",
    title: "Software Engineering Participant",
    subtitle: "Magang & Studi Independen Bersertifikat (MSIB) - PT Global Investment Institusi (Learning X Academy)",
    description: [
      'Participated in an intensive technical upskilling framework, culminating in the development of "Chicken Yasaka", a full-stack e-commerce platform utilizing Python (Flask), jQuery (AJAX), and MongoDB.',
      "Developed robust business logic including secure user authentication, dynamic cart management, and an admin dashboard, culminating in multiple position offers from technical partners.",
    ],
    certificate: {
      url: "/file/work/msib.pdf",
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
      "Engaged in faculty-led research internships, developing ESAO (AI Essay Grading) and DigiArc (Web3 Decentralized Storage).",
      "Served as Teaching Assistant for Data Structures & Algorithms, Databases, and Backend Development.",
      "Published research paper in MIND Journal on Student Retention Prediction using Genetic Algorithm-optimized Random Forest (GA-RF) with SMOTE.",
      "Active in internal campus event committees and student competitions.",
    ],
    link: {
      url: "https://ejurnal.itenas.ac.id/index.php/mindjournal/article/view/15673",
      label: "Final Assignment",
    },
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
    icon: "map",
    title: "RoadSense (Smart GIS Navigation)",
    description:
      "Web-based Geographic Information System (GIS) mapping road damage through crowdsourcing with smart routing. Powered by T3 Stack (Next.js 15, tRPC), Leaflet, Flask (Shapely), and OSRM.",
    url: "https://github.com/LIan2nd/RoadSense",
    image: "/img/projects/roadsense.png",
  },
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
      "Automated essay grading system. Decoupled architecture using Flask (Python) for Langchain Architecture and Next.js for the client-side.",
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
    icon: "film",
    title: "L-Movie (Movie Discovery)",
    description:
      "Frontend movie discovery and exploration web application developed for the Frontend Programming midterm exam (UTS). Implements client-side REST API fetching to consume and render movie database catalogs dynamically.",
    url: "https://lmovie.liand.web.id",
    image: "/img/projects/l-movie.png",
  },
  {
    icon: "server",
    title: "HRD RESTful API (Express.js)",
    description:
      "Modular MVC & OOP backend architecture for HRD management built with Express.js and MySQL. Implements class-based controllers, DAO models, parameterized queries, and RESTful API patterns.",
    url: "https://github.com/LIan2nd/uas-pemrograman-backend",
    image: "/img/projects/hrd-api.png",
  },
  {
    icon: "gamepad",
    title: "Tetrisn't (Reverse Puzzle Game)",
    description:
      "Strategic puzzle game built with Unity (C#). Inverts classic mechanics where perfection is failure—lines only clear when left with exactly one gap.",
    url: "https://github.com/LIan2nd/Tetrisn-t",
    image: "/img/projects/tetrisn't.png",
  },
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
    skills: ["UI/UX Design", "Web Development", "Figma"],
  },
  {
    title: "MBKM Course Batch 7: Full Stack Web Development",
    issuer: "LearningX",
    date: "Nov 2024",
    credentialUrl:
      "/file/certifications/MBKM Course Batch 7 Full Stack Web Development.pdf",
    skills: ["Full Stack", "JQuery", "Flask (Python)"],
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
