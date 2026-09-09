import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cvQuery, cvSkillsQuery, cvProjectsQuery, cvHeaderQuery, updateCvMutation } from "@/entities/cv";
import { skillCategoriesQuery } from "@/entities/skill";
import { currentAccountQuery } from "@/entities/employee";
import { cvPreviewQuery } from "@/features/cv-preview/api/previewOperations";
import { cvTabs } from "../model/cvTabs";
import { CvDetailsPage } from "./CvDetailsPage";

const categories = { request: { query: skillCategoriesQuery }, result: { data: { skillCategories: [{ id: "frontend", name: "Frontend", order: 1, parent: null, children: [] }] } } };
const account = { request: { query: currentAccountQuery }, result: { data: { me: { id: "owner", email: "owner@example.com", avatar: null, first_name: "Test", last_name: "User" } } } };
const cv = { __typename: "Cv", id: "cv1", name: "Engineer", education: "University", description: "Experience", user: { id: "owner", email: "owner@example.com" }, skills: [{ name: "React", categoryId: "frontend", mastery: "Expert" }], languages: [{ name: "English", proficiency: "C1" }], projects: [] };
function details(owner = "owner", query = cvQuery) {
  return { maxUsageCount: 3, request: { query, variables: { cvId: "cv1" } }, result: { data: { cv: { ...cv, user: { id: owner, email: `${owner}@example.com` } } } } };
}
afterEach(() => window.history.replaceState(null, "", "/"));
describe("CV details", () => {
  it("renders hydrated details immediately without refetching", () => {
    const cache = new InMemoryCache();
    cache.writeQuery({ query: currentAccountQuery, data: account.result.data });
    cache.writeQuery({ query: cvQuery, variables: { cvId: "cv1" }, data: details().result.data });
    render(<MockedProvider cache={cache} mocks={[]}><CvDetailsPage cvId="cv1" /></MockedProvider>);
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue("Experience");
    expect(screen.queryByRole("status", { name: "Loading CV" })).not.toBeInTheDocument();
  });

  it.each([
    { tab: "details", query: cvQuery },
    { tab: "skills", query: cvSkillsQuery },
    { tab: "projects", query: cvProjectsQuery },
    { tab: "preview", query: cvHeaderQuery },
  ] as const)("handles a missing CV on the $tab tab", async ({ tab, query }) => {
    render(<MockedProvider mocks={[
      account,
      { request: { query, variables: { cvId: "missing" } }, result: { data: { cv: null } } },
    ]}><CvDetailsPage cvId="missing" initialTab={tab} /></MockedProvider>);
    expect(await screen.findByText("CV not found")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("loads description first and requests CV skills only when their tab opens", async () => {
    const user = userEvent.setup();
    const descriptionResult = vi.fn(() => details().result);
    const skillsResult = vi.fn(() => ({ data: { cv: { __typename: "Cv", id: cv.id, name: cv.name, user: cv.user, skills: cv.skills } } }));
    render(<MockedProvider mocks={[
      account,
      { request: details().request, result: descriptionResult },
      { request: details("owner", cvSkillsQuery).request, result: skillsResult },
      categories,
    ]}><CvDetailsPage cvId="cv1" /></MockedProvider>);
    expect(await screen.findByRole("textbox", { name: "Description" })).toHaveValue("Experience");
    expect(descriptionResult).toHaveBeenCalledOnce();
    expect(skillsResult).not.toHaveBeenCalled();
    await user.click(screen.getByRole("tab", { name: "Skills" }));
    expect(await screen.findByRole("button", { name: "Update React" })).toBeInTheDocument();
    expect(skillsResult).toHaveBeenCalledOnce();
    expect(descriptionResult).toHaveBeenCalledOnce();
  });

  it.each([false, true])("keeps the CV name visible while another tab is loading (cache cleared: %s)", async (clearCache) => {
    const user = userEvent.setup();
    const cache = new InMemoryCache();
    render(<MockedProvider cache={cache} mocks={[
      account, details(),
      { ...details("owner", cvSkillsQuery), delay: Infinity },
      { ...details("owner", cvHeaderQuery), delay: Infinity },
      { request: { query: cvPreviewQuery, variables: { cvId: "cv1" } }, delay: Infinity },
      { ...details("owner", cvProjectsQuery), delay: Infinity },
    ]}><CvDetailsPage cvId="cv1" /></MockedProvider>);
    await screen.findByRole("textbox", { name: "Name" });
    if (clearCache) act(() => { cache.evict({ id: "ROOT_QUERY", fieldName: "cv" }); });
    for (const tab of ["Skills", "Projects", "Preview"]) {
      await user.click(screen.getByRole("tab", { name: tab }));
      expect(screen.getByRole("status", { name: tab === "Preview" ? /Loading CV/ : "Loading CV" })).toBeInTheDocument();
      expect(within(screen.getByRole("navigation", { name: "breadcrumb" })).getByText("Engineer")).toBeInTheDocument();
    }
  });

  it("opens a direct Skills URL without requesting description", async () => {
    const descriptionResult = vi.fn(() => details().result);
    render(<MockedProvider mocks={[
      account,
      { request: details().request, result: descriptionResult },
      details("owner", cvSkillsQuery), categories,
    ]}><CvDetailsPage cvId="cv1" initialTab="skills" /></MockedProvider>);
    expect(await screen.findByRole("button", { name: "Update React" })).toBeInTheDocument();
    expect(descriptionResult).not.toHaveBeenCalled();
  });

  it.each(["owner", "other"])("displays details only for the current owner (%s)", async (owner) => {
    render(<MockedProvider mocks={[account, details(owner)]}><CvDetailsPage cvId="cv1" /></MockedProvider>);
    if (owner === "owner") {
      expect(await screen.findByRole("textbox", { name: "Name" })).toHaveValue("Engineer");
      expect(screen.getByRole("textbox", { name: "Education" })).toHaveValue("University");
      expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue("Experience");
      expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
      const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
      expect(within(breadcrumb).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["CVs", "Engineer", "Details"]);
      expect(within(breadcrumb).getByRole("link", { name: "CVs" })).toHaveAttribute("href", "/cvs");
    } else {
      expect(await screen.findByText("CV not found")).toBeInTheDocument();
      expect(screen.queryByRole("textbox", { name: "Description" })).not.toBeInTheDocument();
    }
  });

  it("changes the URL, panel, underline and breadcrumb with keyboard navigation and browser history", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[account, details(), details("owner", cvSkillsQuery), details("owner", cvHeaderQuery), details("owner", cvProjectsQuery), { request: { query: cvPreviewQuery, variables: { cvId: "cv1" } }, delay: Infinity }, categories]}><CvDetailsPage cvId="cv1" /></MockedProvider>);
    await screen.findByRole("textbox", { name: "Name" });
    const detailsTab = screen.getByRole("tab", { name: "Details" });
    detailsTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(window.location.pathname).toBe("/cvs/cv1/skills");
    expect(screen.getByRole("tab", { name: "Skills" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Skills" })).toHaveClass("border-primary");
    expect(await screen.findByRole("button", { name: "Update React" })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "breadcrumb" })).getByText("Skills")).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("tab", { name: "Projects" }));
    expect(window.location.pathname).toBe("/cvs/cv1/projects");
    act(() => { window.history.replaceState(null, "", "/cvs/cv1/skills"); window.dispatchEvent(new PopStateEvent("popstate")); });
    expect(screen.getByRole("tab", { name: "Skills" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Skills" })).toBeInTheDocument();
  });

  it.each(cvTabs)("restores $label from the route on a fresh page load", async ({ value, label }) => {
    window.history.replaceState(null, "", `/cvs/cv1/${value}`);
    render(<MockedProvider mocks={[account, details(), details("owner", cvSkillsQuery), details("owner", cvHeaderQuery), details("owner", cvProjectsQuery), { request: { query: cvPreviewQuery, variables: { cvId: "cv1" } }, delay: Infinity }, categories]}><CvDetailsPage cvId="cv1" initialTab={value} /></MockedProvider>);
    await screen.findByText("Engineer", { selector: "nav span" });
    expect(screen.getByRole("tab", { name: label })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: label })).toBeInTheDocument();
    if (value === "projects") expect(screen.getByRole("searchbox", { name: "Search CV projects" })).toBeInTheDocument();
    if (value === "preview") expect(screen.getByRole("button", { name: "Export PDF" })).toBeDisabled();
  });

  it("loads projects for the selected CV instead of projects cached for another CV", async () => {
    const cache = new InMemoryCache();
    cache.writeQuery({ query: cvProjectsQuery, variables: { cvId: "other" }, data: { cv: { ...cv, id: "other", projects: [{ __typename: "CvProject", id: "p1", name: "Other CV project", domain: "Finance", description: "Other", responsibilities: [], start_date: "2024-01-01", end_date: null }] } } });
    render(<MockedProvider cache={cache} mocks={[account, details("owner", cvProjectsQuery)]}><CvDetailsPage cvId="cv1" initialTab="projects" /></MockedProvider>);
    expect(await screen.findByText("No projects added yet")).toBeInTheDocument();
    expect(screen.queryByText("Other CV project")).not.toBeInTheDocument();
  });

  it("retries a failed projects request", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      account,
      { request: { query: cvProjectsQuery, variables: { cvId: "cv1" } }, error: new Error("Unavailable") },
      details("owner", cvProjectsQuery),
    ]}><CvDetailsPage cvId="cv1" initialTab="projects" /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load projects");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No projects added yet")).toBeInTheDocument();
  });

  it("updates the selected CV and breadcrumb through the details form", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[account, details(), { request: { query: updateCvMutation, variables: { cv: { cvId: "cv1", name: "Senior Engineer", education: "University", description: "Experience" } } }, result: { data: { updateCv: { ...cv, name: "Senior Engineer" } } } }]}><CvDetailsPage cvId="cv1" /></MockedProvider>);
    fireEvent.change(await screen.findByRole("textbox", { name: "Name" }), { target: { value: "Senior Engineer" } });
    await user.click(screen.getByRole("button", { name: "UPDATE" }));
    expect(await screen.findByRole("status")).toHaveTextContent("CV updated");
    await waitFor(() => expect(within(screen.getByRole("navigation", { name: "breadcrumb" })).getByText("Senior Engineer")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
  });
});
