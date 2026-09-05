import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "./progress";

describe("Progress", () => {
  it("keeps the visual fill consistent with its accessible value and custom maximum", () => {
    render(<Progress aria-label="Upload" value={50} max={200} />);
    const progress = screen.getByRole("progressbar", { name: "Upload" });
    expect(progress).toHaveAttribute("aria-valuenow", "50");
    expect(progress).toHaveAttribute("aria-valuemax", "200");
    expect(progress.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({ transform: "translateX(-75%)" });
  });

  it("uses an indeterminate state when no measured progress is available", () => {
    render(<Progress aria-label="Upload" />);
    expect(screen.getByRole("progressbar", { name: "Upload" })).toHaveAttribute("data-state", "indeterminate");
    expect(screen.getByRole("progressbar", { name: "Upload" })).not.toHaveAttribute("aria-valuenow");
  });
});
