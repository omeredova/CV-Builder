import type { CvProject } from "@/entities/cv";
import { CollectionAddButton } from "@/shared/ui/collection-actions";
import { CollectionSearch } from "@/shared/ui/collection-search";
import { useCvProjects } from "../model/useCvProjects";
import { CvProjectsTable } from "./CvProjectsTable";

interface CvProjectsProps {
  projects: readonly CvProject[];
}

export function CvProjects({ projects }: CvProjectsProps) {
  const { search, setSearch, items, sortField, sortOrder, sortBy } = useCvProjects(projects);
  return <>
    <div className="mb-table-search-gap ml-table-search-margin flex flex-wrap items-center justify-between gap-4">
      <CollectionSearch aria-label="Search CV projects" value={search} onChange={(event) => setSearch(event.target.value)} />
      <CollectionAddButton variant="primaryV2" disabled className="disabled:bg-transparent disabled:text-primary">ADD PROJECT</CollectionAddButton>
    </div>
    {items.length ? <CvProjectsTable projects={items} sortField={sortField} sortOrder={sortOrder} onSort={sortBy} />
      : <p role="status" className="py-16 text-center text-muted-foreground">{projects.length ? "No projects found" : "No projects added yet"}</p>}
  </>;
}
