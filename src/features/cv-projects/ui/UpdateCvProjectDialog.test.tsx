import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cvProjectDetailsQuery, cvProjectsQuery, updateCvProjectMutation } from "@/entities/cv";
import { positionsQuery } from "@/entities/employee";
import { UpdateCvProjectDialog } from "./UpdateCvProjectDialog";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.unstubAllGlobals());
const project = { id: "catalog-id", name: "Platform", domain: "Finance", description: "Payments", environment: ["React"], start_date: "2024-01-01", end_date: "2024-12-31" };
const assignment = { ...project, id: "assignment-id", project, start_date: "2024-03-01", end_date: null, roles: ["Engineer"], responsibilities: ["Review code"] };
const details = { request: { query: cvProjectDetailsQuery, variables: { cvId: "cv1" } }, result: { data: { cv: { __typename: "Cv", id: "cv1", projects: [assignment] } } } };
const roles = { request: { query: positionsQuery, variables: { page: 1 } }, result: { data: { options: { items: [{ id: "r1", name: "Engineer" }, { id: "r2", name: "Lead" }], total_pages: 1 } } } };
const request = { query: updateCvProjectMutation, variables: { project: { cvId: "cv1", projectId: "catalog-id", start_date: "2024-03-01", end_date: null, roles: ["Engineer"], responsibilities: ["Updated work"] } } };

describe("Update CV Project", () => {
  it("loads CV-specific values, keeps catalog fields read-only, and detects valid changes", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[details, roles]}><UpdateCvProjectDialog cvId="cv1" assignmentId="assignment-id" onClose={vi.fn()} onSaved={vi.fn()} /></MockedProvider>);
    expect(await screen.findByRole("combobox", { name: "Name" })).toHaveTextContent("Platform");
    expect(screen.getByRole("combobox", { name: "Name" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Domain" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Description" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Environment" })).toBeDisabled();
    expect(screen.getByLabelText("Start Date")).toHaveValue("2024-03-01");
    expect(screen.getByLabelText("End Date")).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Responsibilities" })).toHaveValue("Review code");
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Roles" })).toBeEnabled());
    fireEvent.change(screen.getByLabelText("Start Date"), { target: { value: "2023-01-01" } });
    expect(screen.getByRole("alert")).toHaveTextContent("Start date must be within project duration");
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Start Date"), { target: { value: "2024-03-01" } });
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
    await user.click(screen.getByRole("combobox", { name: "Roles" }));
    await user.click(screen.getByRole("option", { name: "Lead, not selected" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Remove Lead" }));
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
  });

  it("sends the catalog ID and updates the selected CV while preserving its owner", async () => {
    const user = userEvent.setup();
    const cache = new InMemoryCache();
    const tableProject = { id: assignment.id, name: project.name, domain: project.domain, description: project.description, start_date: assignment.start_date, end_date: null, responsibilities: ["Review code"] };
    const selected = { __typename: "Cv", id: "cv1", name: "Selected CV", user: { id: "employee" }, projects: [tableProject] };
    const other = { ...selected, id: "cv2", name: "Other CV" };
    for (const cv of [selected, other]) cache.writeQuery({ query: cvProjectsQuery, variables: { cvId: cv.id }, data: { cv } });
    const onSaved = vi.fn();
    render(<MockedProvider cache={cache} mocks={[details, roles, { request, result: { data: { updateCvProject: { id: "cv1", projects: [{ ...tableProject, responsibilities: ["Updated work"] }] } } } }]}><UpdateCvProjectDialog cvId="cv1" assignmentId="assignment-id" onClose={vi.fn()} onSaved={onSaved} /></MockedProvider>);
    fireEvent.change(await screen.findByRole("textbox", { name: "Responsibilities" }), { target: { value: "Updated work" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "UPDATE" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "UPDATE" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(cache.readQuery({ query: cvProjectsQuery, variables: { cvId: "cv1" } })).toEqual({ cv: { ...selected, projects: [{ ...tableProject, responsibilities: ["Updated work"] }] } });
    expect(cache.readQuery({ query: cvProjectsQuery, variables: { cvId: "cv2" } })).toEqual({ cv: other });
  });

  it("returns focus to the row action button after loading and closing", async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return <><button id="cv-project-actions-assignment-id" onClick={() => setOpen(true)}>Actions for Platform</button>{open && <UpdateCvProjectDialog cvId="cv1" assignmentId="assignment-id" onClose={() => setOpen(false)} onSaved={() => setOpen(false)} />}</>;
    }
    render(<MockedProvider mocks={[details, roles]}><Example /></MockedProvider>);
    const trigger = screen.getByRole("button", { name: "Actions for Platform" });
    await user.click(trigger);
    await screen.findByRole("textbox", { name: "Responsibilities" });
    await user.click(screen.getByRole("button", { name: "CANCEL" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("retains edits after a failed update", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<MockedProvider mocks={[details, roles, { request, error: new Error("Unavailable") }]}><UpdateCvProjectDialog cvId="cv1" assignmentId="assignment-id" onClose={vi.fn()} onSaved={onSaved} /></MockedProvider>);
    fireEvent.change(await screen.findByRole("textbox", { name: "Responsibilities" }), { target: { value: "Updated work" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "UPDATE" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "UPDATE" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to update project");
    expect(screen.getByRole("textbox", { name: "Responsibilities" })).toHaveValue("Updated work");
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("retries a failed detail request and handles an assignment removed from the CV", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request: details.request, error: new Error("Unavailable") },
      { request: details.request, result: { data: { cv: { __typename: "Cv", id: "cv1", projects: [] } } } },
    ]}><UpdateCvProjectDialog cvId="cv1" assignmentId="assignment-id" onClose={vi.fn()} onSaved={vi.fn()} /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load project");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Project is no longer assigned to this CV")).toBeInTheDocument();
  });
});
