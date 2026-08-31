import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SignUpForm } from "./sign-up-form";

describe("SignUpForm", () => {
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
});
