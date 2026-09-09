import { describe, expect, it } from "vitest";
import type { CvProjectDetails } from "@/entities/cv";
import { calculateSkillUsage, createPreview, formatPreviewDate } from "./preview";

const now = new Date("2026-09-09T00:00:00Z");
function project(start: string, end: string | null, environment = ["React"]): CvProjectDetails {
  return { id: start, name: "Assignment", description: "", domain: "", start_date: "2025-01-01", end_date: null, roles: [], responsibilities: [],
    project: { id: start, name: "Source project", description: "", domain: "Finance", start_date: start, end_date: end, environment } };
}

describe("CV preview calculations", () => {
  it("uses earliest source project start, rounds down at the anniversary, and uses the latest end year", () => {
    expect(calculateSkillUsage("React", [project("2022-09-10", "2023-01-01"), project("2024-01-01", "2025-06-01")], now)).toEqual({ years: 3, lastUsed: 2025 });
    expect(calculateSkillUsage("React", [project("2022-09-09", null)], now)).toEqual({ years: 4, lastUsed: 2026 });
  });
  it("matches whole environment entries and leaves unused skills uncalculated", () => {
    const projects = [project("2022-01-01", null, [" React ", "JavaScript"])];
    expect(calculateSkillUsage("react", projects, now)).toEqual({ years: 4, lastUsed: 2026 });
    expect(calculateSkillUsage("Java", projects, now)).toEqual({ years: null, lastUsed: null });
    expect(calculateSkillUsage("React", [], now)).toEqual({ years: null, lastUsed: null });
  });
  it("does not invent experience for invalid or future dates", () => {
    expect(calculateSkillUsage("React", [project("invalid", null), project("2027-01-01", null)], now)).toEqual({ years: null, lastUsed: null });
    expect(formatPreviewDate("invalid")).toBe("—");
    expect(formatPreviewDate("2023-08-21")).toBe("08.2023");
  });
  it("deduplicates domains and includes only assigned skills and populated categories", () => {
    const result = createPreview({ id: "cv", name: "CV", education: null, description: "", user: null,
      skills: [{ name: "React", categoryId: "frontend", mastery: "Expert" }], projects: [project("2022-01-01", null), project("2023-01-01", null)],
    }, [{ id: "frontend", name: "Frontend", order: 1 }, { id: "empty", name: "Empty", order: 2 }], now);
    expect(result.domains).toEqual(["Finance"]);
    expect(result.groups.map(({ name }) => name)).toEqual(["Frontend"]);
    expect(result.groups[0].skills.map(({ name }) => name)).toEqual(["React"]);
  });
});
