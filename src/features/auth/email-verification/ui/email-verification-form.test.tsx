import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EmailVerificationForm } from "./email-verification-form";

describe("EmailVerificationForm", () => {
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
});
