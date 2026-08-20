import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ContactSection } from "@/components/ContactSection";

describe("ContactSection", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("submits form successfully and resets inputs", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success" }),
    });

    render(<ContactSection />);

    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email address");
    const msgInput = screen.getByPlaceholderText("Leave a message here");
    const submitBtn = screen.getByRole("button", { name: /send message/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(msgInput, "Hello there!");

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Your message has been sent/i)).toBeInTheDocument();
    });

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(msgInput).toHaveValue("");

    // Verify it submitted to /api/contact with JSON body
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );

    // Verify the body contains required fields and anti-spam fields
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.name).toBe("John Doe");
    expect(body.email).toBe("john@example.com");
    expect(body.message).toBe("Hello there!");
    expect(body._honeypot).toBe("");
    expect(typeof body._timing).toBe("number");
  });

  it("shows error alert and preserves inputs on fetch failure", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    render(<ContactSection />);

    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email address");
    const msgInput = screen.getByPlaceholderText("Leave a message here");
    const submitBtn = screen.getByRole("button", { name: /send message/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(msgInput, "Preserved message!");

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Failed to send message/i)).toBeInTheDocument();
    });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(msgInput).toHaveValue("Preserved message!");
  });

  it("shows server error message on non-ok response", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ status: "error", error: "Too many messages. Please try again later." }),
    });

    render(<ContactSection />);

    await user.type(screen.getByPlaceholderText("Name"), "Test");
    await user.type(screen.getByPlaceholderText("Email address"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Leave a message here"), "Hi");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Too many messages/i)).toBeInTheDocument();
    });
  });

  it("includes honeypot field that is visually hidden", () => {
    render(<ContactSection />);

    // The honeypot input should exist in the DOM but be hidden
    const honeypotInput = document.getElementById("contact-website") as HTMLInputElement;
    expect(honeypotInput).toBeTruthy();
    expect(honeypotInput.value).toBe("");

    // Its parent container should have accessibility hidden attributes
    const container = honeypotInput.closest("[aria-hidden]");
    expect(container).toBeTruthy();
    expect(container?.getAttribute("aria-hidden")).toBe("true");
  });

  // Feature: portfolio-nextjs-migration, Property 8: Form validation rejection
  it("Property 8: rejects submission and prevents fetch for invalid fields", () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    fc.assert(
      fc.property(
        fc.record({
          name: fc.constantFrom("", "   ", "\t\n  "),
          email: fc.constantFrom("invalid-email", "test@", "@example.com", "user@"),
          message: fc.constantFrom("", "   ", "\n\t"),
        }),
        (invalidInputs) => {
          cleanup();
          fetchSpy.mockClear();
          render(<ContactSection />);

          const nameInput = screen.getByPlaceholderText("Name");
          const emailInput = screen.getByPlaceholderText("Email address");
          const msgInput = screen.getByPlaceholderText("Leave a message here");
          const submitBtn = screen.getByRole("button", { name: /send message/i });

          fireEvent.change(nameInput, { target: { value: invalidInputs.name } });
          fireEvent.change(emailInput, { target: { value: invalidInputs.email } });
          fireEvent.change(msgInput, { target: { value: invalidInputs.message } });

          fireEvent.click(submitBtn);

          expect(fetchSpy).not.toHaveBeenCalled();

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
