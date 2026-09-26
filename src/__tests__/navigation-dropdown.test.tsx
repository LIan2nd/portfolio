import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { NavigationDropdown } from "@/components/NavigationDropdown";

const links = [{ href: "/gallery", label: "Gallery" }];

function renderDropdown(variant: "desktop" | "mobile" = "desktop") {
  render(
    <>
      {variant === "mobile" ? (
        <ul>
          <NavigationDropdown label="Explore" links={links} variant="mobile" />
        </ul>
      ) : (
        <NavigationDropdown label="Explore" links={links} />
      )}
      <button type="button">Outside navigation</button>
    </>
  );

  return screen.getByRole("button", { name: "Explore" });
}

describe("NavigationDropdown", () => {
  afterEach(cleanup);

  it.each(["desktop", "mobile"] as const)(
    "closes the %s submenu on Escape and returns focus to its trigger",
    async (variant) => {
      const user = userEvent.setup();
      const trigger = renderDropdown(variant);

      await user.click(trigger);
      await user.tab();
      expect(screen.getByRole("link", { name: "Gallery" })).toHaveFocus();

      await user.keyboard("{Escape}");

      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveFocus();
      expect(screen.queryByRole("link", { name: "Gallery" })).toBeNull();
    }
  );

  it("keeps the desktop submenu open after hover ends while focus remains inside", async () => {
    const user = userEvent.setup();
    const trigger = renderDropdown();

    await user.click(trigger);
    await user.tab();
    const galleryLink = screen.getByRole("link", { name: "Gallery" });
    expect(galleryLink).toHaveFocus();

    await user.unhover(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Gallery" })).toHaveFocus();

    await user.tab();

    expect(screen.getByRole("button", { name: "Outside navigation" })).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("makes the collapsed mobile submenu inert and hides its links from accessibility navigation", async () => {
    const user = userEvent.setup();
    const trigger = renderDropdown("mobile");
    const submenu = document.getElementById(trigger.getAttribute("aria-controls")!);

    expect(submenu).toHaveAttribute("inert");
    expect(submenu).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link", { name: "Gallery" })).toBeNull();

    await user.click(trigger);

    expect(submenu).not.toHaveAttribute("inert");
    expect(submenu).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/gallery");

    await user.click(trigger);

    expect(submenu).toHaveAttribute("inert");
    expect(submenu).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link", { name: "Gallery" })).toBeNull();
  });
});
