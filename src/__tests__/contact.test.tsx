import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ContactSection } from "@/components/ContactSection";

describe("ContactSection", () => {
  const dummyScriptUrl = "https://script.google.com/macros/s/test/exec";

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

    render(<ContactSection scriptUrl={dummyScriptUrl} />);

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
  });

  it("shows error alert and preserves inputs on fetch failure", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    render(<ContactSection scriptUrl={dummyScriptUrl} />);

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
          render(<ContactSection scriptUrl={dummyScriptUrl} />);

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
