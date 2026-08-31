import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordRecoveryForm } from "./password-recovery-form";

describe("PasswordRecoveryForm", () => {
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
      "/account/login",
    );
  });
});
