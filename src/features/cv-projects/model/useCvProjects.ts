import { useState } from "react";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import type { CvProject } from "@/entities/cv";

export type CvProjectSortField = "name" | "start_date" | "end_date";
export type CvProjectSortOrder = "asc" | "desc";

export function useCvProjects(projects: readonly CvProject[]) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<CvProjectSortField>("name");
  const [sortOrder, setSortOrder] = useState<CvProjectSortOrder>("asc");
  const term = useDebouncedValue(search.trim().toLocaleLowerCase());
  const items = projects.filter((project) =>
    project.name.toLocaleLowerCase().includes(term) || project.domain.toLocaleLowerCase().includes(term),
  ).sort((left, right) => {
    const a = left[sortField];
    const b = right[sortField];

    const comparison = a === b ? 0 : a === null ? 1 : b === null ? -1 : a.localeCompare(b);
    return sortOrder === "asc" ? comparison : -comparison;
  });

  function sortBy(field: CvProjectSortField): void {
    setSortOrder(field === sortField && sortOrder === "asc" ? "desc" : "asc");
    setSortField(field);
  }

  return { search, setSearch, sortField, sortOrder, sortBy, items };
}

export function formatProjectDate(value: string | null): string {
  if (!value) return "Till now";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${month}/${day}/${year}` : value;
}
