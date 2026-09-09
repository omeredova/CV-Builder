import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { skillCategoriesQuery } from "@/entities/skill";
import { cvPreviewQuery, exportPdfMutation, type PreviewCv } from "../api/previewOperations";
import { CvPreview } from "./CvPreview";

const cv: PreviewCv = { id: "cv", name: "Software Engineer", education: "University", description: "Build accessible products", skills: [], projects: [],
  user: { id: "owner", position: { name: "Engineer" }, profile: { first_name: "Alex", last_name: "Smith", languages: [{ name: "English", proficiency: "C1" }] } } };
const request = { query: cvPreviewQuery, variables: { cvId: "cv" } };
const preview = { request, result: { data: { cv } } };
const categories = { request: { query: skillCategoriesQuery }, result: { data: { skillCategories: [] } } };
afterEach(() => vi.restoreAllMocks());

describe("CV preview", () => {
  it("shows the employee resume without editing controls", async () => {
    render(<MockedProvider mocks={[preview, categories]}><CvPreview cvId="cv" ownerId="owner" /></MockedProvider>);
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeDisabled();
    expect(await screen.findByRole("heading", { name: "Alex Smith" })).toBeInTheDocument();
    expect(screen.getByText("English — C1")).toBeInTheDocument();
    expect(screen.getByText("No projects added yet")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeEnabled();
  });
  it.each([null, { ...cv, user: { ...cv.user!, id: "other" } }])("withholds missing or another employee's preview", async (value) => {
    render(<MockedProvider mocks={[{ request, result: { data: { cv: value } } }]}><CvPreview cvId="cv" ownerId="owner" /></MockedProvider>);
    expect(await screen.findByText("CV preview is not available")).toBeInTheDocument();
    expect(screen.queryByText("Alex Smith")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeDisabled();
  });
  it("retries failed preview loading", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[{ request, error: new Error("Unavailable") }, preview, categories]}><CvPreview cvId="cv" ownerId="owner" /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load CV preview");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("heading", { name: "Alex Smith" })).toBeInTheDocument();
  });
  it("exports the hydrated resume only on click and permits retry after export failure", async () => {
    const user = userEvent.setup();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:pdf") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    const download = vi.spyOn(document.body, "append");
    const variables = vi.fn((value: { pdf: { html: string } }) => value.pdf.html.includes("Alex Smith") && !value.pdf.html.includes("Export PDF"));
    const cache = new InMemoryCache();
    cache.writeQuery({ ...request, data: preview.result.data });
    cache.writeQuery({ ...categories.request, data: categories.result.data });
    render(<MockedProvider cache={cache} mocks={[
      { request: { query: exportPdfMutation, variables }, error: new Error("Unavailable") },
      { request: { query: exportPdfMutation, variables }, result: { data: { exportPdf: btoa("%PDF-1.7\n") } } },
    ]}><CvPreview cvId="cv" ownerId="owner" /></MockedProvider>);
    expect(screen.getByRole("heading", { name: "Alex Smith" })).toBeInTheDocument();
    expect(variables).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Export PDF" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to export PDF");
    await user.click(screen.getByRole("button", { name: "Export PDF" }));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(download.mock.calls.some(([element]) => element instanceof HTMLAnchorElement && element.download === "software-engineer.pdf")).toBe(true);
  });
});
