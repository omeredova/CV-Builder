import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordResetForm } from "./password-reset-form";

describe("PasswordResetForm", () => {
  it("validates both fields and enables submission for matching valid passwords", async () => {
    const user = userEvent.setup();
    render(<PasswordResetForm />);

    const password = screen.getByLabelText("New Password");
    const confirmation = screen.getByLabelText("Confirm Password");
    const submit = screen.getByRole("button", { name: "Submit" });

    expect(submit).toBeDisabled();
    await user.type(password, "123456");
    await user.type(confirmation, "654321");
    await user.tab();
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

    await user.clear(confirmation);
    await user.type(confirmation, "123456");
    expect(submit).toBeEnabled();
  });

  it("toggles password visibility independently and renders request errors", async () => {
    const user = userEvent.setup();
    render(<PasswordResetForm resetError="expiredLink" />);

    const password = screen.getByLabelText("New Password");
    const confirmation = screen.getByLabelText("Confirm Password");
    const toggles = screen.getAllByRole("button", { name: "Show password" });

    await user.click(toggles[0]);
    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "password");

    await user.click(toggles[1]);
    expect(confirmation).toHaveAttribute("type", "text");
    expect(screen.getByText("This password reset link has expired")).toHaveAttribute(
      "role",
      "alert",
    );
  });

  it("links back to the sign-in page", () => {
    render(<PasswordResetForm />);

    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute(
      "href",
      "/account/login",
    );
  });
});
