import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createCvMutation, updateCvMutation, deleteCvMutation, cvQuery } from "@/entities/cv";
import { EditCvDialog } from "./EditCvDialog";
import { CvFormDialog } from "./CvFormDialog";
import { DeleteCvDialog } from "./DeleteCvDialog";

const values = { name: "Engineer", education: "University", description: "Experience" };
const cv = { ...values, id: "cv1", user: { id: "owner", email: "owner@example.com" } };
describe("CV dialogs", () => {
  it("handles a CV deleted before its edit dialog loads", async () => {
    render(<MockedProvider mocks={[
      { request: { query: cvQuery, variables: { cvId: "missing" } }, result: { data: { cv: null } } },
    ]}><EditCvDialog cvId="missing" userId="owner" onClose={vi.fn()} onSaved={vi.fn()} /></MockedProvider>);
    expect(await screen.findByText("CV not found")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it.each([false, true])("preserves fields after failed save and supports retry (edit: %s)", async (edit) => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const request = { query: edit ? updateCvMutation : createCvMutation, variables: { cv: { ...values, ...(edit ? { cvId: "cv1" } : { userId: "owner" }) } } };
    render(<MockedProvider mocks={[{ request, error: new Error("Offline") }, { request, result: { data: { [edit ? "updateCv" : "createCv"]: cv } } }]}><CvFormDialog cv={edit ? cv : undefined} userId="owner" onClose={vi.fn()} onSaved={onSaved} /></MockedProvider>);
    if (!edit) {
      fireEvent.blur(screen.getByRole("textbox", { name: "Name" }));
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      for (const [key, value] of Object.entries(values)) fireEvent.change(screen.getByRole("textbox", { name: key[0].toUpperCase() + key.slice(1) }), { target: { value } });
    }
    await user.click(screen.getByRole("button", { name: edit ? "SAVE" : "CREATE" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(`Failed to ${edit ? "update" : "create"} CV`);
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Engineer");
    expect(onSaved).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: edit ? "SAVE" : "CREATE" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });
  it("keeps failed deletion open and deletes only the selected CV on confirmation", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    const request = { query: deleteCvMutation, variables: { cv: { cvId: "cv1" } } };
    render(<MockedProvider mocks={[{ request, error: new Error("Offline") }, { request, result: { data: { deleteCv: { __typename: "DeleteResult" } } } }]}><DeleteCvDialog cv={cv} onClose={vi.fn()} onDeleted={onDeleted} /></MockedProvider>);
    expect(screen.getByRole("dialog", { name: "Delete CV" })).toHaveAccessibleDescription("Are you sure you want to delete CV Engineer?");
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to delete CV");
    expect(onDeleted).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce());
  });
});
