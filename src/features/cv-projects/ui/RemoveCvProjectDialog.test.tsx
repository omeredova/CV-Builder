import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { useQuery } from "@apollo/client/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { cvProjectDetailsQuery, cvProjectsQuery, removeCvProjectMutation, type CvProjects as CvProjectsData, type CvQueryData } from "@/entities/cv";
import { CvProjects } from "./CvProjects";

const project = { __typename: "CvProject", id: "assignment", name: "Platform", domain: "Finance", description: "Payments", responsibilities: [], start_date: "2024-01-01", end_date: null };
const cv = { __typename: "Cv", id: "cv1", name: "CV", user: { __typename: "User", id: "owner" }, projects: [project] };
const details = () => ({ request: { query: cvProjectDetailsQuery, variables: { cvId: "cv1" } }, result: { data: { cv: { __typename: "Cv", id: "cv1", projects: [{ ...project, roles: [], project: { __typename: "Project", id: "catalog-id", name: "Platform", domain: "Finance", description: "Payments", environment: [], start_date: "2024-01-01", end_date: null } }] } } } });
const request = { query: removeCvProjectMutation, variables: { project: { cvId: "cv1", projectId: "catalog-id" } } };
function Harness() {
  const { data } = useQuery<CvQueryData<CvProjectsData>>(cvProjectsQuery, { variables: { cvId: "cv1" } });
  return <CvProjects cvId="cv1" projects={data?.cv?.projects ?? []} />;
}
function cache() {
  const result = new InMemoryCache();
  result.writeQuery({ query: cvProjectsQuery, variables: { cvId: "cv1" }, data: { cv } });
  return result;
}
async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Actions for Platform" }));
  await user.click(screen.getByRole("menuitem", { name: "Delete" }));
  return user;
}
describe("Remove CV project", () => {
  it("shows the project name and cancels without changing the list, restoring focus", async () => {
    render(<MockedProvider cache={cache()}><Harness /></MockedProvider>);
    const user = await open();
    expect(screen.getByRole("dialog", { name: "Remove CV project" })).toHaveTextContent("Are you sure you want to remove project Platform?");
    await user.click(screen.getByRole("button", { name: "CANCEL" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions for Platform" })).toHaveFocus();
  });
  it("uses the catalog ID, blocks duplicate submission, and updates the cached list", async () => {
    const result = vi.fn(() => ({ data: { removeCvProject: { __typename: "Cv", id: "cv1", projects: [] } } }));
    render(<MockedProvider cache={cache()} mocks={[details(), { request, result, delay: 100 }]}><Harness /></MockedProvider>);
    const user = await open();
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(screen.getByRole("button", { name: "REMOVING…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeDisabled();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(result).toHaveBeenCalledOnce();
    expect(screen.getByText("No projects added yet")).toBeInTheDocument();
    expect(screen.getByText("Project removed")).toBeInTheDocument();
  });
  it("keeps the project after an error and allows retry", async () => {
    render(<MockedProvider cache={cache()} mocks={[details(), { request, error: new Error("Unavailable") }, details(), { request, result: { data: { removeCvProject: { __typename: "Cv", id: "cv1", projects: [] } } } }]}><Harness /></MockedProvider>);
    const user = await open();
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to remove project. Please try again.");
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("No projects added yet")).toBeInTheDocument();
  });
});
