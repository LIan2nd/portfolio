import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { AboutSection } from "@/components/AboutSection";
import { SKILLS, PERSONAL_DETAILS, SOCIALS } from "@/lib/data";
import { PROFILE_PHOTOS } from "@/lib/profilePhotos";
import type { Skill } from "@/lib/types";

describe("AboutSection & SkillBadge", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders every profile image with factual alt text and intrinsic dimensions", () => {
    render(
      <AboutSection
        skills={SKILLS}
        details={PERSONAL_DETAILS}
        socials={SOCIALS}
      />
    );

    PROFILE_PHOTOS.forEach((photo) => {
      const img = screen.getByAltText(photo.alt);

      expect(img).toHaveAttribute("src", photo.src);
      expect(img).toHaveAttribute("width", photo.width.toString());
      expect(img).toHaveAttribute("height", photo.height.toString());
      expect(img).toHaveAttribute("loading", "lazy");
    });

    expect(new Set(PROFILE_PHOTOS.map((photo) => photo.alt)).size).toBe(
      PROFILE_PHOTOS.length,
    );
  });

  it("uses a semantic section label and a real email link", () => {
    const { container } = render(
      <AboutSection
        skills={SKILLS}
        details={PERSONAL_DETAILS}
        socials={SOCIALS}
      />,
    );

    expect(container.querySelector("#about")).toHaveAttribute(
      "aria-labelledby",
      "about-alfian",
    );

    const email = PERSONAL_DETAILS.find((detail) => detail.isEmail);
    expect(email).toBeDefined();
    expect(screen.getByRole("link", { name: email!.value })).toHaveAttribute(
      "href",
      `mailto:${email!.value.replace("[at]", "@")}`,
    );
  });

  it("renders all personal details accurately", () => {
    render(
      <AboutSection
        skills={SKILLS}
        details={PERSONAL_DETAILS}
        socials={SOCIALS}
      />
    );

    PERSONAL_DETAILS.forEach((detail) => {
      expect(screen.getByText(detail.label)).toBeInTheDocument();
      expect(screen.getByText(detail.value)).toBeInTheDocument();
    });
  });

  it("renders social links opening in a new tab with noopener noreferrer", () => {
    render(
      <AboutSection
        skills={SKILLS}
        details={PERSONAL_DETAILS}
        socials={SOCIALS}
      />
    );

    SOCIALS.forEach((social) => {
      const link = screen.getByLabelText(social.label);
      expect(link).toHaveAttribute("href", social.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  // Feature: portfolio-nextjs-migration, Property 3: Skills badge rendering completeness
  it("Property 3: renders exactly one SkillBadge per skill, matching text content", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.stringMatching(/^[A-Za-z0-9+#.-]{1,20}$/),
          { minLength: 1, maxLength: 20 }
        ),
        (skillNames) => {
          cleanup();
          const skills: Skill[] = skillNames.map((name) => ({ name }));

          const { container } = render(
            <AboutSection
              skills={skills}
              details={PERSONAL_DETAILS}
              socials={SOCIALS}
            />
          );

          const badges = Array.from(container.querySelectorAll("small")).map(
            (el) => el.textContent
          );
          expect(badges).toEqual(skillNames);

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
