import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResumePage, { metadata } from "@/app/resume/page";
import sitemap from "@/app/sitemap";
import { PUBLICATION, SKILLS } from "@/lib/data";

describe("Resume page", () => {
  it("defines unique metadata and a self-referencing canonical", () => {
    expect(metadata.title).toEqual({
      absolute: "Resume — Alfian Nur Usyaid",
    });
    expect(metadata.description).toContain("Resume of Alfian Nur Usyaid");
    expect(metadata.alternates).toEqual({
      canonical: "https://portfolio.liand.web.id/resume",
    });
    expect(metadata.openGraph).toMatchObject({
      title: "Resume — Alfian Nur Usyaid",
      url: "https://portfolio.liand.web.id/resume",
      siteName: "LIand",
    });
  });

  it("renders crawlable resume content and preserves the PDF download", () => {
    render(<ResumePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Resume — Alfian Nur Usyaid",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Experience" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Technical Skills" }),
    ).toBeInTheDocument();
    expect(screen.getByText(PUBLICATION.title)).toBeInTheDocument();

    SKILLS.forEach((skill) => {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    });

    const pdfLinks = screen.getAllByRole("link", { name: /download.*pdf/i });
    expect(pdfLinks.length).toBeGreaterThan(0);
    pdfLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/resume.pdf");
      expect(link).toHaveAttribute("download");
    });
  });

  it("links the ProfilePage schema to the stable Person entity", () => {
    const { container } = render(<ResumePage />);
    const schema = container.querySelector('script[type="application/ld+json"]');

    expect(schema).not.toBeNull();
    const graph = JSON.parse(schema!.textContent ?? "{}") as {
      "@graph": Array<Record<string, unknown>>;
    };

    expect(graph["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "ProfilePage",
          mainEntity: {
            "@id": "https://portfolio.liand.web.id/#person",
          },
        }),
        expect.objectContaining({
          "@type": "Person",
          "@id": "https://portfolio.liand.web.id/#person",
          name: "Alfian Nur Usyaid",
          alternateName: "LIand",
          image: {
            "@id":
              "https://portfolio.liand.web.id/img/profile/profile-1.png#image",
          },
        }),
        expect.objectContaining({
          "@type": "ImageObject",
          "@id":
            "https://portfolio.liand.web.id/img/profile/profile-1.png#image",
          contentUrl:
            "https://portfolio.liand.web.id/img/profile/profile-1.png",
          width: 800,
          height: 1200,
        }),
      ]),
    );
  });

  it("promotes the canonical HTML resume URL in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://portfolio.liand.web.id/resume");
    expect(urls).not.toContain("https://portfolio.liand.web.id/resume.pdf");
    expect(urls).not.toContain(
      "https://portfolio.liand.web.id/file/resume.pdf",
    );
  });
});
