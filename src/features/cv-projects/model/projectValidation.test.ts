import { describe, expect, it } from "vitest";
import type { Project } from "@/entities/project";
import { validateProject, type ProjectValues } from "./projectValidation";

const project: Project = { id: "p", name: "Platform", domain: "Finance", description: "Description", environment: ["React"], start_date: "2024-01-01", end_date: "2024-12-31" };
const values: ProjectValues = { projectId: "p", start_date: "2024-01-01", end_date: "2024-12-31", roles: ["Engineer"], responsibilities: "" };
describe("CV project validation", () => {
  it("accepts project boundaries and an optional end date", () => {
    expect(validateProject(values, project)).toEqual({});
    expect(validateProject({ ...values, end_date: "" }, project)).toEqual({});
  });
  it.each([
    ["2023-12-31", "2024-12-31", "start_date"],
    ["2025-01-01", "", "start_date"],
    ["2024-01-01", "2025-01-01", "end_date"],
    ["2024-06-01", "2024-05-01", "end_date"],
    ["2024-02-30", "", "start_date"],
  ] as const)("rejects invalid participation dates %s – %s", (start_date, end_date, field) => {
    expect(validateProject({ ...values, start_date, end_date }, project)[field]).toBeTruthy();
  });
  it("requires a project, start date and at least one role", () => {
    expect(Object.keys(validateProject({ ...values, projectId: "", start_date: "", roles: [] }, undefined))).toEqual(["projectId", "start_date", "roles"]);
  });
});
