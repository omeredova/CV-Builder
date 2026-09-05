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
