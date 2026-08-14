import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="project" aria-label="Featured projects" className="py-20 px-6 max-md:py-12 text-center">
      <div className="max-w-[800px] mx-auto">
        <span className="text-accent text-xs font-semibold uppercase tracking-widest">Overview</span>
        <h2 className="text-3xl max-sm:text-2xl font-bold mt-1 mb-8">
          Featured Projects
        </h2>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
