import { groupSkills, type SkillCategory } from "@/entities/skill";
import type { CvProjectDetails } from "@/entities/cv";
import type { PreviewCv } from "../api/previewOperations";

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPreviewDate(value: string): string {
  const date = parseDate(value);
  return date ? `${String(date.getUTCMonth() + 1).padStart(2, "0")}.${date.getUTCFullYear()}` : "—";
}

export function calculateSkillUsage(name: string, projects: readonly CvProjectDetails[], now: Date): { years: number | null; lastUsed: number | null } {
  const matching = projects.filter(({ project }) => project.environment.some((skill) => skill.trim().toLowerCase() === name.trim().toLowerCase()));

  const starts = matching.flatMap(({ project }) => {
    const date = parseDate(project.start_date);
    return date && date <= now ? [date] : [];
  });
  const earliest = starts.length ? new Date(Math.min(...starts.map(Number))) : null;
  let years: number | null = null;
  if (earliest) {
    years = now.getUTCFullYear() - earliest.getUTCFullYear();
    if (now.getUTCMonth() < earliest.getUTCMonth() || (now.getUTCMonth() === earliest.getUTCMonth() && now.getUTCDate() < earliest.getUTCDate())) years--;
  }
  const ends = matching.flatMap(({ project }) => {
    const start = parseDate(project.start_date);
    if (!start || start > now) return [];
    const end = project.end_date ? parseDate(project.end_date) : now;
    return end ? [Math.min(end.getUTCFullYear(), now.getUTCFullYear())] : [];
  });
  return { years, lastUsed: ends.length ? Math.max(...ends) : null };
}

export function createPreview(cv: PreviewCv, categories: readonly SkillCategory[], now: Date) {
  const projects = cv.projects ?? [];
  return {
    name: cv.name,
    fullName: [cv.user?.profile.first_name, cv.user?.profile.last_name].filter(Boolean).join(" "),
    position: cv.user?.position?.name,
    education: cv.education,
    description: cv.description,
    languages: cv.user?.profile.languages ?? [],
    domains: [...new Set(projects.map(({ project }) => project.domain.trim()).filter(Boolean))],
    projects,
    groups: groupSkills(cv.skills, categories).map((group) => ({
      ...group,
      skills: group.skills.map((skill) => ({ ...skill, ...calculateSkillUsage(skill.name, projects, now) })),
    })),
  };
}

export type CvPreviewDocument = ReturnType<typeof createPreview>;
