import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addCvProjectMutation, cvProjectsQuery } from "@/entities/cv";
import { positionsQuery } from "@/entities/employee";
import { projectCatalogQuery } from "@/entities/project";
import { AddCvProjectDialog } from "./AddCvProjectDialog";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.unstubAllGlobals());

const project = { id: "p1", name: "Platform", domain: "Finance", description: "Payment processing", environment: ["React"], start_date: "2024-01-01", end_date: "2024-12-31" };
const catalog = { request: { query: projectCatalogQuery, variables: { page: 1 } }, result: { data: { projects: { items: [project], page: 1, total_pages: 1 } } } };
const roles = { request: { query: positionsQuery, variables: { page: 1 } }, result: { data: { options: { items: [{ id: "r1", name: "Engineer" }, { id: "r2", name: "Lead" }], total_pages: 1 } } } };
const mutationRequest = { query: addCvProjectMutation, variables: { project: { cvId: "cv1", projectId: "p1", start_date: "2024-01-01", end_date: "2024-12-31", roles: ["Engineer", "Lead"], responsibilities: ["Review code", "Build features"] } } };
async function fillForm() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Name" }));
  await user.click(await screen.findByRole("option", { name: "Platform" }));
  await waitFor(() => expect(screen.getByRole("combobox", { name: "Roles" })).toBeEnabled());
  await user.click(screen.getByRole("combobox", { name: "Roles" }));
  await user.click(await screen.findByRole("option", { name: "Engineer, not selected" }));
  await user.click(screen.getByRole("option", { name: "Lead, not selected" }));
  await user.keyboard("{Escape}");
  fireEvent.change(screen.getByRole("textbox", { name: "Responsibilities" }), { target: { value: "Review code\nBuild features" } });
  return user;
}
describe("Add CV Project", () => {
  it("populates catalog fields, saves participation to the selected CV, and updates only its cache", async () => {
    const cache = new InMemoryCache();
    const onSaved = vi.fn();
    const other = { id: "cv2", name: "Other", user: { id: "owner" }, projects: [] };
    cache.writeQuery({ query: cvProjectsQuery, variables: { cvId: "cv2" }, data: { cv: other } });
    const saved = { id: "cv1", name: "Selected", user: { id: "owner" }, projects: [{ id: "assignment", name: project.name, domain: project.domain, description: project.description, start_date: project.start_date, end_date: project.end_date, responsibilities: ["Review code", "Build features"] }] };
    cache.writeQuery({ query: cvProjectsQuery, variables: { cvId: "cv1" }, data: { cv: { ...saved, projects: [] } } });
    render(<MockedProvider cache={cache} mocks={[catalog, roles, { request: mutationRequest, result: { data: { addCvProject: { id: saved.id, projects: saved.projects } } } }]}><AddCvProjectDialog cvId="cv1" onClose={vi.fn()} onSaved={onSaved} /></MockedProvider>);
    expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
    const user = await fillForm();
    expect(screen.getByRole("textbox", { name: "Domain" })).toHaveValue("Finance");
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue("Payment processing");
    expect(screen.getByRole("textbox", { name: "Description" })).toBeDisabled();
    expect(screen.getByLabelText("Start Date")).toHaveValue("2024-01-01");
    expect(screen.getByRole("combobox", { name: "Environment" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "ADD" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(cache.readQuery({ query: cvProjectsQuery, variables: { cvId: "cv1" } })).toEqual({ cv: saved });
    expect(cache.readQuery({ query: cvProjectsQuery, variables: { cvId: "cv2" } })).toEqual({ cv: other });
  });
  it("preserves fields after a failed mutation and lets the user retry", async () => {
    render(<MockedProvider mocks={[catalog, roles, { request: mutationRequest, error: new Error("Unavailable") }]}><AddCvProjectDialog cvId="cv1" onClose={vi.fn()} onSaved={vi.fn()} /></MockedProvider>);
    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "ADD" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to add project");
    expect(screen.getByRole("textbox", { name: "Responsibilities" })).toHaveValue("Review code\nBuild features");
    expect(screen.getByRole("button", { name: "ADD" })).toBeEnabled();
  });
});
