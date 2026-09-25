import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GalleryGrid } from "./GalleryGrid";

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: React.ComponentProps<"img"> & { priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}));

const item = {
  id: "photo-1",
  title: "Panning after Rain",
  description: "Waiting for the right light on a rainy street.",
  alt: "A moving car reflected on a wet street",
  imageUrl: "https://gallery.example.com/gallery/photo-1.webp",
  objectKey: "gallery/photo-1.webp",
  width: 1600,
  height: 1200,
  takenAt: "2026-09-20",
  createdAt: "2026-09-25T10:00:00.000Z",
};

describe("GalleryGrid", () => {
  it("opens a photo in a modal and restores focus after closing", async () => {
    const user = userEvent.setup();
    render(<GalleryGrid items={[item]} />);

    const trigger = screen.getByRole("button", {
      name: "Preview Panning after Rain",
    });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", {
      name: "Panning after Rain",
    });
    expect(within(dialog).getByText(item.description)).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(document.body.style.overflow).toBe("");
  });
});
