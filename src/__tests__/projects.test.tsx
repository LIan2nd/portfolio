import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectsSection } from "@/components/ProjectsSection";
import { PROJECTS } from "@/lib/data";
import type { Project } from "@/lib/types";

describe("ProjectsSection & ProjectCard", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders all projects from props", () => {
    render(<ProjectsSection projects={PROJECTS} />);
    PROJECTS.forEach((p) => {
      expect(screen.getByText(p.title)).toBeInTheDocument();
      expect(screen.getByText(p.description)).toBeInTheDocument();
    });
  });

  // Feature: portfolio-nextjs-migration, Property 6: Project card completeness
  it("Property 6: renders all project elements with valid URL as external link", () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom("shield-lock", "robot", "calendar-event", "shop", "gear"),
          title: fc.string({ minLength: 3, maxLength: 30 }),
          description: fc.string({ minLength: 10, maxLength: 80 }),
          url: fc.webUrl(),
        }),
        (project: Project) => {
          cleanup();
          const { container } = render(<ProjectCard project={project} />);

          const link = container.querySelector("a");
          expect(link).not.toBeNull();
          expect(link).toHaveAttribute("href", project.url);
          expect(link).toHaveAttribute("target", "_blank");
          expect(link).toHaveAttribute("rel", "noopener noreferrer");

          const titleEl = container.querySelector("h3");
          expect(titleEl?.textContent).toBe(project.title);

          const descEl = container.querySelector("p");
          expect(descEl?.textContent).toBe(project.description);

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: portfolio-nextjs-migration, Property 7: Coming Soon card non-interactivity
  it("Property 7: project without URL renders as non-interactive element", () => {
    fc.assert(
      fc.property(
        fc.record({
          icon: fc.constantFrom("gear", "shop"),
          title: fc.constant("Coming Soon"),
          description: fc.string({ minLength: 10, maxLength: 80 }),
        }),
        (project: Project) => {
          cleanup();
          const { container } = render(<ProjectCard project={project} />);

          expect(container.querySelector("a")).toBeNull();

          const titleEl = container.querySelector("h3");
          expect(titleEl?.textContent).toBe("Coming Soon");

          const descEl = container.querySelector("p");
          expect(descEl?.textContent).toBe(project.description);

          const card = container.firstChild as HTMLElement;
          expect(card.className).toContain("cursor-not-allowed");

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
