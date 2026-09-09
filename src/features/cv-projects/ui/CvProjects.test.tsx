import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CvProject } from "@/entities/cv";
import { DEFAULT_DEBOUNCE_DELAY_MS } from "@/shared/lib/use-debounced-value";
import { CvProjects } from "./CvProjects";

const projects: CvProject[] = [
  { id: "1", name: "Alpha", domain: "Finance", description: "Payments", responsibilities: ["Review code"], start_date: "2024-02-01", end_date: null },
  { id: "2", name: "Beta", domain: "Healthcare", description: "Appointments", responsibilities: [], start_date: "2023-12-01", end_date: "2024-06-01" },
];
function names(): string[] {
  return within(screen.getByRole("table")).getAllByRole("button", { name: /^Actions for/ }).map((button) => button.getAttribute("aria-label") ?? "");
}
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("CV projects", () => {
  it("keeps search and the add action visible for an empty CV", () => {
    render(<CvProjects cvId="cv1" projects={[]} />);
    expect(screen.getByRole("searchbox", { name: "Search CV projects" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD PROJECT" })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent("No projects added yet");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
  it("searches names and domains case-insensitively and restores results when cleared", async () => {
    vi.useFakeTimers();
    render(<CvProjects cvId="cv1" projects={projects} />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "HEALTH" } });
    await act(() => vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(names()).toEqual(["Actions for Beta"]);
    fireEvent.change(search, { target: { value: "" } });
    fireEvent.change(search, { target: { value: "ALPHA" } });
    await act(() => vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(names()).toEqual(["Actions for Alpha"]);
    fireEvent.change(search, { target: { value: "ALPHAmissing" } });
    await act(() => vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(screen.getByRole("status")).toHaveTextContent("No projects found");
    expect(search).toHaveValue("ALPHAmissing");
    fireEvent.change(search, { target: { value: "" } });
    await act(() => vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(names()).toEqual(["Actions for Alpha", "Actions for Beta"]);
  });
  it("sorts names and participation dates in both directions without mutating input", async () => {
    const user = userEvent.setup();
    render(<CvProjects cvId="cv1" projects={projects} />);
    await user.click(screen.getByRole("button", { name: "Sort by Name" }));
    expect(names()).toEqual(["Actions for Beta", "Actions for Alpha"]);
    for (const column of ["Start Date", "End Date"]) {
      const button = screen.getByRole("button", { name: `Sort by ${column}` });
      await user.click(button);
      expect(button.closest("th")).toHaveAttribute("aria-sort", "ascending");
      expect(names()).toEqual(["Actions for Beta", "Actions for Alpha"]);
      await user.click(button);
      expect(button.closest("th")).toHaveAttribute("aria-sort", "descending");
      expect(names()).toEqual(["Actions for Alpha", "Actions for Beta"]);
    }
    expect(screen.getByText("Till now")).toBeInTheDocument();
    expect(screen.getByText("02/01/2024")).toBeInTheDocument();
    expect(projects.map(({ id }) => id)).toEqual(["1", "2"]);
  });
});
