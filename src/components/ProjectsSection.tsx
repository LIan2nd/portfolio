import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="project" aria-label="Featured projects" className="py-10 md:py-14 px-6 text-center">
      <div className="max-w-[800px] mx-auto">
        <span className="text-accent text-xs font-semibold uppercase tracking-widest">Overview</span>
        <h2 className="text-3xl max-sm:text-2xl font-bold mt-1 mb-4">
          Featured Projects
        </h2>
        <p className="font-serif leading-7 text-sm opacity-90 mb-8 max-w-[620px] mx-auto">
          A curated selection of web development and software engineering projects spanning fullstack applications,
          AI-powered platforms, geographic information systems, and Web3 decentralized solutions — built with
          modern technologies including Next.js, React, TypeScript, Laravel, Flask, and Solidity.
        </p>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
