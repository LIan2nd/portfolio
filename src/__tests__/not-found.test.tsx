import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound, { metadata } from "@/app/not-found";

describe("NotFound page", () => {
  it("renders branded recovery actions", () => {
    const { container } = render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Halaman ini nyasar." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Error 404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LIand home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Kembali ke Home" }),
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Lihat Resume" })).toHaveAttribute(
      "href",
      "/resume",
    );

    expect(container.querySelector("main")).toHaveClass(
      "h-screen",
      "max-h-screen",
      "overflow-hidden",
    );
    expect(
      screen.getByRole("navigation", { name: "404 navigation" }),
    ).toHaveClass(
      "grid-cols-[auto_1fr_auto]",
      "md:grid-cols-[1fr_auto_1fr]",
      "py-5",
      "max-md:py-3.5",
    );
    expect(container.querySelector("#not-found-background")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(container.querySelector("main img")).toBeNull();
  });

  it("defines noindex metadata for missing URLs", () => {
    expect(metadata.title).toEqual({
      absolute: "404 — Halaman Tidak Ditemukan | LIand",
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
