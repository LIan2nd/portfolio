import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProfilePhotoStack } from "@/components/ProfilePhotoStack";
import { PROFILE_PHOTOS } from "@/lib/profilePhotos";

describe("ProfilePhotoStack", () => {
  it("includes every stable original image URL in server-rendered HTML", () => {
    const html = renderToStaticMarkup(
      <ProfilePhotoStack photos={PROFILE_PHOTOS} />,
    );

    PROFILE_PHOTOS.forEach((photo) => {
      expect(html).toContain(`src=\"${photo.src}\"`);
      expect(html).toContain(`alt=\"${photo.alt}\"`);
    });
  });

  it("cycles the active photo through the native gallery button", async () => {
    const user = userEvent.setup();
    render(<ProfilePhotoStack photos={PROFILE_PHOTOS} />);

    const nextButton = screen.getByRole("button", {
      name: /show next photo of alfian nur usyaid/i,
    });
    expect(nextButton).toHaveAccessibleName(/photo 1 of 4/i);

    await user.click(nextButton);

    expect(nextButton).toHaveAccessibleName(/photo 2 of 4/i);
    expect(
      screen.getByRole("button", { name: /show photo 2 of 4/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("allows direct keyboard selection of any photo", async () => {
    const user = userEvent.setup();
    render(<ProfilePhotoStack photos={PROFILE_PHOTOS} />);

    const fourthPhotoButton = screen.getByRole("button", {
      name: /show photo 4 of 4/i,
    });

    fourthPhotoButton.focus();
    await user.keyboard("{Enter}");

    expect(fourthPhotoButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/showing photo 4 of 4/i)).toHaveTextContent(
      PROFILE_PHOTOS[3].alt,
    );
  });
});
