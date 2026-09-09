import { RemoveCvProjectDialog } from "./RemoveCvProjectDialog";
import { useState } from "react";
import { UpdateCvProjectDialog } from "./UpdateCvProjectDialog";
import { AddCvProjectDialog } from "./AddCvProjectDialog";
import type { CvProject } from "@/entities/cv";
import { CollectionAddButton } from "@/shared/ui/collection-actions";
import { CollectionSearch } from "@/shared/ui/collection-search";
import { useCvProjects } from "../model/useCvProjects";
import { CvProjectsTable } from "./CvProjectsTable";

interface CvProjectsProps {
  projects: readonly CvProject[];
  cvId: string;
}

export function CvProjects({ projects, cvId }: CvProjectsProps) {
  const [removing, setRemoving] = useState<CvProject>();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [notice, setNotice] = useState("");
  const { search, setSearch, items, sortField, sortOrder, sortBy } = useCvProjects(projects);
  return <>
    <div className="mb-table-search-gap ml-table-search-margin flex flex-wrap items-center justify-between gap-4">
      <CollectionSearch aria-label="Search CV projects" value={search} onChange={(event) => setSearch(event.target.value)} />
      <CollectionAddButton variant="primaryV2" onClick={() => { setNotice(""); setAdding(true); }}>ADD PROJECT</CollectionAddButton>
    </div>
    {items.length ? <CvProjectsTable projects={items} sortField={sortField} sortOrder={sortOrder} onSort={sortBy} onRemove={(project) => { setNotice(""); setRemoving(project); }} onUpdate={(id) => { setNotice(""); setEditingId(id); }} />
      : <p role="status" className="py-16 text-center text-muted-foreground">{projects.length ? "No projects found" : "No projects added yet"}</p>}
    {notice && <p role="status" className="mt-4 text-sm text-muted-foreground">{notice}</p>}
    {removing && <RemoveCvProjectDialog cvId={cvId} project={removing} onClose={() => setRemoving(undefined)} onRemoved={() => { setRemoving(undefined); setNotice("Project removed"); }} />}
    {editingId && <UpdateCvProjectDialog cvId={cvId} assignmentId={editingId} onClose={() => setEditingId(undefined)} onSaved={() => { setEditingId(undefined); setNotice("Project updated"); }} />}
    {adding && <AddCvProjectDialog cvId={cvId} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); setSearch(""); setNotice("Project added"); }} />}
  </>;
}
