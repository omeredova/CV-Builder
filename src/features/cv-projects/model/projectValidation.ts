import type { Project } from "@/entities/project";

export interface ProjectValues {
  projectId: string;
  start_date: string;
  end_date: string;
  roles: string[];
  responsibilities: string;
}
export type ProjectErrors = Partial<Record<keyof ProjectValues, string>>;

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validateProject(values: ProjectValues, project: Project | undefined): ProjectErrors {
  const errors: ProjectErrors = {};
  if (!project) errors.projectId = "Project is required";
  if (!values.start_date) errors.start_date = "Start date is required";
  else if (!validDate(values.start_date)) errors.start_date = "Enter a valid start date";
  else if (project && (values.start_date < project.start_date || (project.end_date && values.start_date > project.end_date))) errors.start_date = "Start date must be within project duration";
  if (values.end_date) {
    if (!validDate(values.end_date)) errors.end_date = "Enter a valid end date";
    else if (values.start_date && values.end_date < values.start_date) errors.end_date = "End date cannot be earlier than start date";
    else if (project && (values.end_date < project.start_date || (project.end_date && values.end_date > project.end_date))) errors.end_date = "End date must be within project duration";
  }
  if (!values.roles.length) errors.roles = "At least one role must be selected";
  return errors;
}
