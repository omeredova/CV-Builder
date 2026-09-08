import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { cvsQuery, cvQuery, type CvListItem } from "@/entities/cv";
import { currentAccountQuery } from "@/entities/employee";
import { CvsPage } from "./CvsPage";

const account = { request: { query: currentAccountQuery }, result: { data: { me: { id: "owner", email: "owner@example.com", avatar: null, first_name: "Test", last_name: "User" } } } };
const own: CvListItem = { id: "cv1", name: "Engineer", education: "University" };
function list(items: CvListItem[], overrides = {}, totalPages = 1) {
  return { request: { query: cvsQuery, variables: { userId: "owner", params: { page: 1, limit: 10, search: "", sort_by: "name", sort_order: "asc", ...overrides } } }, result: { data: { cvsByUserId: { items: items.map((cv) => ({ __typename: "Cv", ...cv })), page: 1, total_pages: totalPages, total: items.length } } } };
}
describe("CVs employee page", () => {
  it("loads only owned records and links the selected CV to details", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[account, list([own]), { request: { query: cvQuery, variables: { cvId: "cv1" } }, result: { data: { cv: { __typename: "Cv", ...own, description: "Experience", user: { id: "owner", email: "owner@example.com" } } } } }]}><CvsPage /></MockedProvider>);
    expect(screen.getByRole("status", { name: "Loading CVs" })).toBeInTheDocument();
    expect(await screen.findByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Experience")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Actions for Engineer" }));
    expect(screen.getByRole("menuitem", { name: "View" })).toHaveAttribute("href", "/cvs/cv1/details");
    await user.click(screen.getByRole("menuitem", { name: "Update" }));
    expect(await screen.findByRole("textbox", { name: "Name" })).toHaveValue("Engineer");
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue("Experience");
  });
  it("combines name search and sort and keeps empty searches visible", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[account, list([own]), list([own], { sort_order: "desc" }), list([], { sort_order: "desc", search: "NO MATCH" })]}><CvsPage /></MockedProvider>);
    await screen.findByText("Engineer");
    await user.click(screen.getByRole("button", { name: "Sort by Name" }));
    await screen.findByText("Engineer");
    expect(screen.getByRole("button", { name: "Sort by Name" }).closest("th")).toHaveAttribute("aria-sort", "descending");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "NO MATCH" } });
    expect(await screen.findByText("No CVs found")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("NO MATCH");
  });
  it("retries list failures and allows creating the first CV", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[account, { request: list([]).request, error: new Error("Offline") }, list([])]}><CvsPage /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load CVs");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("You have no CVs yet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "CREATE CV" }));
    expect(screen.getByRole("dialog", { name: "Create CV" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CREATE" })).toBeDisabled();
  });
  it("keeps the page-size selector available after all records fit on one page", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      account, list([own], {}, 2), list([own], { limit: 50 }), list([own], {}, 2),
    ]}><CvsPage /></MockedProvider>);
    await screen.findByText("Engineer");
    await user.click(screen.getByRole("button", { name: "Rows per page: 10" }));
    await user.click(screen.getByRole("menuitem", { name: "50" }));
    await screen.findByText("Engineer");
    expect(screen.queryByRole("link", { name: "Page 2" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Rows per page: 50" }));
    await user.click(screen.getByRole("menuitem", { name: "10" }));
    expect(await screen.findByRole("link", { name: "Page 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rows per page: 10" })).toBeInTheDocument();
  });

  it("requests another page within the current user scope", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[account, list([own], {}, 2), list([{ ...own, id: "cv2", name: "Second CV" }], { page: 2 }, 2)]}><CvsPage /></MockedProvider>);
    await screen.findByText("Engineer");
    await user.click(screen.getByRole("link", { name: "Page 2" }));
    expect(await screen.findByText("Second CV")).toBeInTheDocument();
  });
});
