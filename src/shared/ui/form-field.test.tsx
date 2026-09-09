import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "@/shared/ui/form-field";

describe("FormField", () => {
  it("supports an active field with an above label and inline validation", () => {
    render(<FormField error="Name is required" id="name" label="Name" labelPlacement="above" variant="active" />);

    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toBeEnabled();
    expect(input).toHaveClass("bg-transparent", "border-primary", "h-control-height");
    expect(input).toHaveAttribute("aria-describedby", "name-error");
    expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
  });

  it("positions an error without changing the field layout", () => {
    render(<FormField error="Name is required" id="name" label="Name" />);

    expect(screen.getByRole("alert")).toHaveClass("absolute", "top-full");
  });
});

describe("FormField accessibility", () => {
  it("keeps both caller help text and inline validation associated with the input", () => {
    render(<>
      <p id="help">Enter your current password.</p>
      <FormField id="password" label="Password" aria-describedby="help" aria-invalid={false} error="Password is required" />
    </>);
    const field = screen.getByLabelText("Password");
    expect(field).toHaveAccessibleDescription("Enter your current password. Password is required");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "password-error");
  });

  it("preserves caller-supplied invalid state without an inline error", () => {
    render(<FormField label="Name" aria-invalid="grammar" />);
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "grammar");
  });
});
