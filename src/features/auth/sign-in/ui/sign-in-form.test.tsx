import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignInForm } from "./sign-in-form";

const { clearError, push, signIn } = vi.hoisted(() => ({
  clearError: vi.fn(),
  push: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("../model/useSignIn", () => ({
  useSignIn: () => ({ clearError, error: undefined, isLoading: false, signIn }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("SignInForm", () => {
  beforeEach(() => {
    clearError.mockReset();
    push.mockReset();
    signIn.mockReset();
    signIn.mockResolvedValue(true);
  });

  it("validates fields and enables submission only for valid values", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    const submit = screen.getByRole("button", { name: "Sign in" });

    expect(submit).toBeDisabled();
    await user.click(email);
    await user.tab();
    expect(screen.getByText("Email is required")).toBeInTheDocument();

    await user.type(email, "invalid");
    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    await user.clear(email);
    await user.type(email, "user@example.com");
    await user.type(password, "12345");
    await user.tab();
    expect(screen.getByText("Password must be at least 6 characters long")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show password" })).toHaveClass("text-primary");
    expect(submit).toBeDisabled();

    await user.type(password, "6");
    expect(submit).toBeEnabled();
  });

  it("toggles password visibility and renders authentication errors", async () => {
    const user = userEvent.setup();
    render(<SignInForm authenticationError="invalidCredentials" />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
    expect(screen.getByText("Invalid email or password")).toHaveAttribute("role", "alert");
  });

  it("authenticates valid credentials and navigates to the application", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "123456",
    });
    expect(push).toHaveBeenCalledWith("/");
  });

  it("keeps credentials and stays on the page after authentication fails", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue(false);
    render(<SignInForm authenticationError="invalidCredentials" />);

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    await user.type(email, "user@example.com");
    await user.type(password, "123456");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(email).toHaveValue("user@example.com");
    expect(password).toHaveValue("123456");
    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
