import { Fragment } from "react";
import { ArrowDown, ArrowUp, MoreVertical } from "lucide-react";
import type { CvProject } from "@/entities/cv";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { primaryFocusRingClassName } from "@/shared/ui/styles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { formatProjectDate, type CvProjectSortField, type CvProjectSortOrder } from "../model/useCvProjects";

interface CvProjectsTableProps {
  projects: readonly CvProject[];
  sortField: CvProjectSortField;
  sortOrder: CvProjectSortOrder;
  onSort: (field: CvProjectSortField) => void;
}

const columns = [
  { label: "Name", field: "name" },
  { label: "Domain" },
  { label: "Responsibilities" },
  { label: "Start Date", field: "start_date" },
  { label: "End Date", field: "end_date" },
] as const;

export function CvProjectsTable({ projects, sortField, sortOrder, onSort }: CvProjectsTableProps) {
  return <Table aria-label="CV projects" className="min-w-[760px] table-fixed">
    <colgroup><col className="w-1/4" /><col className="w-1/5" /><col /><col className="w-32" /><col className="w-32" /><col className="w-cv-column-actions" /></colgroup>
    <TableHeader><TableRow>
      {columns.map((column) => {
        const field = "field" in column ? column.field : undefined;
        const active = field === sortField;
        return <TableHead key={column.label} scope="col" aria-sort={field ? active ? sortOrder === "asc" ? "ascending" : "descending" : "none" : undefined}>
          {field ? <button type="button" aria-label={`Sort by ${column.label}`} className={`inline-flex items-center gap-1 rounded-sm ${primaryFocusRingClassName}`} onClick={() => onSort(field)}>
            {column.label}{active && sortOrder === "asc" ? <ArrowUp aria-hidden="true" className="size-4" /> : <ArrowDown aria-hidden="true" className="size-4" />}
          </button> : column.label}
        </TableHead>;
      })}
      <TableHead scope="col"><span className="sr-only">Actions</span></TableHead>
    </TableRow></TableHeader>
    <TableBody>{projects.map((project) => <Fragment key={project.id}>
      <TableRow className="border-0">
        <TableCell className="whitespace-normal break-words text-table">{project.name}</TableCell>
        <TableCell className="whitespace-normal break-words text-table">{project.domain}</TableCell>
        <TableCell className="whitespace-normal break-words text-table">{project.responsibilities.length ? <ul className="flex flex-wrap gap-1">{project.responsibilities.map((responsibility, index) => <li key={`${index}-${responsibility}`} className="rounded-control bg-disabled px-2 py-0.5">{responsibility}</li>)}</ul> : "—"}</TableCell>
        <TableCell className="text-table">{formatProjectDate(project.start_date)}</TableCell>
        <TableCell className="text-table">{formatProjectDate(project.end_date)}</TableCell>
        <TableCell className="px-0"><DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="icon" size="actionIcon" aria-label={`Actions for ${project.name}`}><MoreVertical aria-hidden="true" className="size-5 fill-current" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" variant="actions"><DropdownMenuItem disabled>Update</DropdownMenuItem><DropdownMenuItem disabled>Delete</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu></TableCell>
      </TableRow>
      <TableRow className="border-table-border"><TableCell colSpan={6} className="whitespace-pre-wrap break-words pt-0 text-table text-muted-foreground">{project.description || "—"}</TableCell></TableRow>
    </Fragment>)}</TableBody>
  </Table>;
}
