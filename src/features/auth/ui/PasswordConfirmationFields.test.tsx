import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PasswordConfirmationFields } from "./PasswordConfirmationFields";

it("keeps labels and visibility controls associated with their own fields across multiple instances", () => {
  const props = { values: { password: "", confirmPassword: "" }, errors: {}, touched: {}, onBlur: vi.fn(), onChange: vi.fn() };
  render(<><PasswordConfirmationFields {...props} /><PasswordConfirmationFields {...props} /></>);
  const fields = [...screen.getAllByLabelText("Password", { exact: true }), ...screen.getAllByLabelText("Confirm Password", { exact: true })];
  expect(new Set(fields.map((field) => field.id)).size).toBe(4);
  for (const toggle of screen.getAllByRole("button", { name: "Show password" })) {
    expect(fields.some((field) => field.id === toggle.getAttribute("aria-controls"))).toBe(true);
  }
});
