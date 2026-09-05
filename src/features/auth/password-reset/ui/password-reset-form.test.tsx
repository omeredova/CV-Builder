import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasswordResetForm } from "./password-reset-form";

const { clearError, push, resetPassword } = vi.hoisted(() => ({
  clearError: vi.fn(),
  push: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock("../model/usePasswordReset", () => ({
  usePasswordReset: () => ({
    clearError,
    error: undefined,
    isLoading: false,
    resetPassword,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("PasswordResetForm", () => {
  beforeEach(() => {
    clearError.mockReset();
    push.mockReset();
    resetPassword.mockReset();
    resetPassword.mockResolvedValue(true);
  });

  it("validates both fields and enables submission for matching valid passwords", async () => {
    const user = userEvent.setup();
    render(<PasswordResetForm token="reset-token" />);

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
    render(<PasswordResetForm resetError="expiredLink" token="reset-token" />);

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
    render(<PasswordResetForm token="reset-token" />);

    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("resets the password and navigates to the application", async () => {
    const user = userEvent.setup();
    render(<PasswordResetForm token="reset-token" />);

    await user.type(screen.getByLabelText("New Password"), "123456");
    await user.type(screen.getByLabelText("Confirm Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(resetPassword).toHaveBeenCalledWith(
      { confirmPassword: "123456", password: "123456" },
      "reset-token",
    );
    expect(push).toHaveBeenCalledWith("/");
  });

  it("rejects a missing reset token without clearing passwords", async () => {
    const user = userEvent.setup();
    resetPassword.mockResolvedValue(false);
    render(<PasswordResetForm token="" />);

    const password = screen.getByLabelText("New Password");
    await user.type(password, "123456");
    await user.type(screen.getByLabelText("Confirm Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(password).toHaveValue("123456");
    expect(screen.getByText("This password reset link has expired")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
