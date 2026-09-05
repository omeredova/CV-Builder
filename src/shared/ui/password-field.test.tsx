import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordField } from "./password-field";

describe("PasswordField", () => {
  it("generates distinct accessible associations and toggles only its own input by keyboard", async () => {
    const user = userEvent.setup();
    render(<><PasswordField label="Current password" /><PasswordField label="New password" /></>);
    const current = screen.getByLabelText("Current password", { exact: true });
    const next = screen.getByLabelText("New password", { exact: true });
    expect(current.id).not.toBe(next.id);
    await user.tab();
    await user.tab();
    expect(document.activeElement).toHaveAttribute("aria-controls", current.id);
    expect(document.activeElement).toHaveAccessibleDescription("Current password");
    await user.keyboard(" ");
    expect(current).toHaveAttribute("type", "text");
    expect(next).toHaveAttribute("type", "password");
  });

  it("excludes disabled inputs and their visibility controls from tab order", async () => {
    const user = userEvent.setup();
    render(<><PasswordField label="Password" disabled /><button>Next</button></>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });
});
