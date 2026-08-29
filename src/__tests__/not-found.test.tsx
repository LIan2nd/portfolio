import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound, { metadata } from "@/app/not-found";

describe("NotFound page", () => {
  it("renders branded recovery actions", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Halaman ini nyasar." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Error 404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LIand" })).toHaveAttribute(
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
  });

  it("defines noindex metadata for missing URLs", () => {
    expect(metadata.title).toEqual({
      absolute: "404 — Halaman Tidak Ditemukan | LIand",
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
