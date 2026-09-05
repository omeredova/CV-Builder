import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";
import { changePasswordMutation } from "../api/changePasswordMutation";
import { PasswordChangeForm } from "./PasswordChangeForm";

const request = { query: changePasswordMutation, variables: { args: { oldPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" } } };
async function fillForm(): Promise<void> {
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "old-password" } });
  fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "new-password" } });
}
describe("PasswordChangeForm", () => {
  it("masks fields independently and validates before enabling submission", async () => {
    const user = userEvent.setup();
    render(<MockedProvider><PasswordChangeForm /></MockedProvider>);
    expect(screen.getByRole("button", { name: "Change" })).toBeDisabled();
    await user.click(screen.getAllByRole("button", { name: "Show password" })[0]);
    expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("New Password")).toHaveAttribute("type", "password");
    await fillForm();
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "different" } });
    fireEvent.blur(screen.getByLabelText("Confirm Password"));
    expect(screen.getByText("Passwords do not match")).toBeVisible();
    expect(screen.getByRole("button", { name: "Change" })).toBeDisabled();
  });
  it("submits the existing API contract and clears values after success", async () => {
    render(<MockedProvider mocks={[{ request, result: { data: { changePassword: { id: "current" } } } }]}><PasswordChangeForm /></MockedProvider>);
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Password changed successfully");
    expect(screen.getByLabelText("Password", { exact: true })).toHaveValue("");
    expect(screen.getByLabelText("New Password")).toHaveValue("");
  });
  it("keeps values and displays current-password server errors inline", async () => {
    render(<MockedProvider mocks={[{ request, result: { errors: [new GraphQLError("Old password is incorrect")] } }]}><PasswordChangeForm /></MockedProvider>);
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Current password is incorrect");
    expect(screen.getByLabelText("Password", { exact: true })).toHaveValue("old-password");
    expect(screen.getByLabelText("New Password")).toHaveValue("new-password");
    await waitFor(() => expect(screen.getByRole("button", { name: "Change" })).toBeEnabled());
  });
  it("preserves values after network errors", async () => {
    render(<MockedProvider mocks={[{ request, error: new Error("Network unavailable") }]}><PasswordChangeForm /></MockedProvider>);
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByLabelText("Confirm Password")).toHaveValue("new-password");
  });
});
