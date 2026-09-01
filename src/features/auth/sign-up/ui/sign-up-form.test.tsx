import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignUpForm } from "./sign-up-form";

const { clearError, push, signUp } = vi.hoisted(() => ({
  clearError: vi.fn(),
  push: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("../model/useSignUp", () => ({
  useSignUp: () => ({ clearError, error: undefined, isLoading: false, signUp }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    clearError.mockReset();
    push.mockReset();
    signUp.mockReset();
    signUp.mockResolvedValue(true);
  });

  it("validates all fields and enables submission only for matching valid values", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    const confirmation = screen.getByLabelText("Confirm Password");
    const submit = screen.getByRole("button", { name: "Create account" });

    expect(submit).toBeDisabled();
    await user.type(email, "user@example.com");
    await user.type(password, "123456");
    await user.type(confirmation, "654321");
    await user.tab();
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

    await user.clear(confirmation);
    await user.type(confirmation, "123456");
    expect(submit).toBeEnabled();
  });

  it("toggles both password fields independently and renders registration errors", async () => {
    const user = userEvent.setup();
    render(<SignUpForm registrationError="emailExists" />);

    const password = screen.getByLabelText("Password");
    const confirmation = screen.getByLabelText("Confirm Password");
    const toggles = screen.getAllByRole("button", { name: "Show password" });

    await user.click(toggles[0]);
    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "password");

    await user.click(toggles[1]);
    expect(confirmation).toHaveAttribute("type", "text");
    expect(screen.getByText("An account with this email already exists")).toHaveAttribute(
      "role",
      "alert",
    );
  });

  it("registers valid values and navigates to email verification", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.type(screen.getByLabelText("Confirm Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(signUp).toHaveBeenCalledWith({
      confirmPassword: "123456",
      email: "user@example.com",
      password: "123456",
    });
    expect(push).toHaveBeenCalledWith("/account/verify-email");
  });

  it("shows a duplicate-email error and keeps the entered values", async () => {
    const user = userEvent.setup();
    signUp.mockResolvedValue(false);
    render(<SignUpForm registrationError="emailExists" />);

    const email = screen.getByLabelText("Email");
    await user.type(email, "existing@example.com");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.type(screen.getByLabelText("Confirm Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("An account with this email already exists")).toBeInTheDocument();
    expect(email).toHaveValue("existing@example.com");
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a friendly message for unexpected registration errors", async () => {
    const user = userEvent.setup();
    signUp.mockResolvedValue(false);
    render(<SignUpForm registrationError="server" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.type(screen.getByLabelText("Confirm Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Something went wrong. Please try again later")).toBeInTheDocument();
  });
});
