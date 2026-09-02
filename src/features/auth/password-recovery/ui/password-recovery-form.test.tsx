import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasswordRecoveryForm } from "./password-recovery-form";

const { clearError, push, requestPasswordReset } = vi.hoisted(() => ({
  clearError: vi.fn(),
  push: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

vi.mock("../model/usePasswordRecovery", () => ({
  usePasswordRecovery: () => ({
    clearError,
    error: undefined,
    isLoading: false,
    requestPasswordReset,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("PasswordRecoveryForm", () => {
  beforeEach(() => {
    clearError.mockReset();
    push.mockReset();
    requestPasswordReset.mockReset();
    requestPasswordReset.mockResolvedValue(true);
  });

  it("validates the email field and links cancel to sign in", async () => {
    const user = userEvent.setup();
    render(<PasswordRecoveryForm />);

    const email = screen.getByLabelText("Email");
    const submit = screen.getByRole("button", { name: "Reset password" });

    expect(submit).toBeDisabled();
    await user.click(email);
    await user.tab();
    expect(screen.getByText("Email is required")).toBeInTheDocument();

    await user.type(email, "invalid");
    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(submit).toBeDisabled();

    await user.clear(email);
    await user.type(email, "user@example.com");
    expect(submit).toBeEnabled();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("requests recovery instructions and returns to sign in", async () => {
    const user = userEvent.setup();
    render(<PasswordRecoveryForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(requestPasswordReset).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("keeps the email and displays a friendly request error", async () => {
    const user = userEvent.setup();
    requestPasswordReset.mockResolvedValue(false);
    render(<PasswordRecoveryForm recoveryError="accountNotFound" />);

    const email = screen.getByLabelText("Email");
    await user.type(email, "missing@example.com");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(email).toHaveValue("missing@example.com");
    expect(screen.getByText("No account found with this email address")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
