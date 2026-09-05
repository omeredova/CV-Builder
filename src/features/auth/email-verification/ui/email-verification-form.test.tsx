import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmailVerificationForm } from "./email-verification-form";

const { clearError, push, verifyEmail } = vi.hoisted(() => ({
  clearError: vi.fn(),
  push: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock("../model/useEmailVerification", () => ({
  useEmailVerification: () => ({
    clearError,
    error: undefined,
    isLoading: false,
    verifyEmail,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

describe("EmailVerificationForm", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    clearError.mockReset();
    push.mockReset();
    verifyEmail.mockReset();
    verifyEmail.mockResolvedValue(true);
  });

  it("shows the sent notification after a successful send redirect", () => {
    window.history.replaceState(null, "", "/verify-email?sent=true");
    render(<EmailVerificationForm />);
    expect(screen.getByRole("status")).toHaveTextContent("Verification email has been sent");
  });

  it("does not claim an email was sent when opened directly", () => {
    render(<EmailVerificationForm />);
    expect(screen.queryByText("Verification email has been sent")).not.toBeInTheDocument();
  });

  it("accepts six digits and enables confirmation", async () => {
    const user = userEvent.setup();
    render(<EmailVerificationForm />);

    const input = screen.getByRole("textbox", { name: "Verification code" });
    const confirm = screen.getByRole("button", { name: "Confirm" });

    expect(confirm).toBeDisabled();
    await user.type(input, "123456");

    expect(input).toHaveValue("123456");
    expect(confirm).toBeEnabled();
  });

  it("supports pasting a complete code", () => {
    render(<EmailVerificationForm />);

    const input = screen.getByLabelText("Verification code");
    fireEvent.paste(input, {
      clipboardData: { getData: () => "654321" },
    });

    expect(input).toHaveValue("654321");
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
  });

  it("renders validation and request errors without clearing the code", async () => {
    const user = userEvent.setup();
    render(<EmailVerificationForm verificationError="expired" />);

    const input = screen.getByLabelText("Verification code");
    await user.type(input, "1");
    await user.tab();

    expect(screen.getByText("Please enter a valid 6-digit code")).toHaveAttribute("role", "alert");
    expect(screen.getByText("Verification code has expired")).toHaveAttribute("role", "alert");
    expect(input).toHaveValue("1");
  });

  it("links the later action to the application", () => {
    render(<EmailVerificationForm />);

    expect(screen.getByRole("link", { name: "Later" })).toHaveAttribute("href", "/");
  });

  it("verifies a complete code and navigates to the application", async () => {
    const user = userEvent.setup();
    render(<EmailVerificationForm />);

    await user.type(screen.getByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(verifyEmail).toHaveBeenCalledWith("123456");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("keeps the code and stays on the page after a failed request", async () => {
    const user = userEvent.setup();
    verifyEmail.mockResolvedValue(false);
    render(<EmailVerificationForm verificationError="invalid" />);

    const input = screen.getByLabelText("Verification code");
    await user.type(input, "123456");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(input).toHaveValue("123456");
    expect(screen.getByText("Invalid verification code")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
