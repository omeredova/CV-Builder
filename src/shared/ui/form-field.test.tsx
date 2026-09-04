import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "@/shared/ui/form-field";

describe("FormField", () => {
  it("positions an error without changing the field layout", () => {
    render(<FormField error="Name is required" id="name" label="Name" />);

    expect(screen.getByRole("alert")).toHaveClass("absolute", "top-full");
  });
});
