import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input, Textarea, inputVariants } from "@/shared/ui/input";

describe("Input", () => {
  it("applies the default input variant", () => {
    render(<Input aria-label="Name" />);

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass(
      "h-control-height",
      "bg-input-background",
      "border-border",
      "px-field-inline",
      "[font-size:var(--text-input)]",
      "placeholder:[font-size:var(--text-input)]",
    );
  });

  it("applies the invalid variant", () => {
    render(<Input aria-label="Name" aria-invalid variant="invalid" />);

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass("border-primary");
  });

  it("exposes variant classes for composition", () => {
    expect(inputVariants({ variant: "invalid" })).toContain("focus:border-primary");
  });
});

describe("Textarea", () => {
  it("uses the textarea size while sharing input variants", () => {
    render(<Textarea aria-label="Description" />);

    expect(screen.getByRole("textbox", { name: "Description" })).toHaveClass(
      "min-h-28",
      "resize-y",
      "border-border",
      "px-field-inline",
      "[font-size:var(--text-input)]",
      "placeholder:[font-size:var(--text-input)]",
    );
  });
});
