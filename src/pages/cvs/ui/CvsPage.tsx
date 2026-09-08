"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, MoreVertical, Plus } from "lucide-react";
import type { CvListItem } from "@/entities/cv";
import { CvFormDialog, EditCvDialog, DeleteCvDialog, useCvs } from "@/features/cvs-management";
import { Button } from "@/shared/ui/button";
import { CollectionPagination } from "@/shared/ui/collection-pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { CollectionSearch } from "@/shared/ui/collection-search";
import { Skeleton } from "@/shared/ui/skeleton";
import { primaryFocusRingClassName } from "@/shared/ui/styles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";

type DialogState = { type: "create" } | { type: "edit" | "delete"; cv: CvListItem } | null;
export function CvsPage() {
  const cvs = useCvs();
  const [dialog, setDialog] = useState<DialogState>(null);
  function saved(): void { setDialog(null); cvs.refresh(); }
  return <>
    <AppBreadcrumb pageName="CVs" />
    <section aria-label="CVs table" className="mx-auto mt-table-offset w-full max-w-table-container-width px-table-page-inline dashboard:max-w-none">
      <div className="mb-table-search-gap ml-table-search-margin flex flex-wrap items-center justify-between gap-4">
        <CollectionSearch aria-label="Search CVs" value={cvs.search} onChange={(event) => cvs.changeSearch(event.target.value)} />
        <Button variant="primaryV2" className="gap-4" disabled={!cvs.account} onClick={() => setDialog({ type: "create" })}><Plus aria-hidden="true" className="size-5" />CREATE CV</Button>
      </div>
      <Table className="table-fixed" aria-busy={cvs.loading}>
        <colgroup><col className="w-cv-column-name" /><col className="w-cv-column-education" /><col /><col className="w-cv-column-actions" /></colgroup>
        <TableHeader><TableRow>
          <TableHead aria-sort={cvs.sortOrder === "asc" ? "ascending" : "descending"}><button type="button" aria-label="Sort by Name" className={`inline-flex items-center gap-1 rounded-sm ${primaryFocusRingClassName}`} onClick={cvs.toggleSort}>Name{cvs.sortOrder === "asc" ? <ArrowUp className="size-4" aria-hidden="true" /> : <ArrowDown className="size-4" aria-hidden="true" />}</button></TableHead>
          <TableHead>Education</TableHead><TableHead>Employee</TableHead><TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {cvs.error ? <TableRow className="h-table-empty"><TableCell colSpan={4} className="text-center"><p role="alert">Failed to load CVs</p><Button variant="secondary" className="mt-4" onClick={cvs.retry}>Retry</Button></TableCell></TableRow>
            : cvs.loading ? <TableRow><TableCell colSpan={4}><Skeleton role="status" aria-label="Loading CVs" className="h-36 w-full" /></TableCell></TableRow>
            : cvs.items.length === 0 ? <TableRow className="h-table-empty"><TableCell colSpan={4} className="text-center"><p role="status">{cvs.search.trim() ? "No CVs found" : "You have no CVs yet"}</p></TableCell></TableRow>
            : cvs.items.map((cv) => <TableRow key={cv.id} className="border-table-border">
                <TableCell className="text-table whitespace-normal break-words">{cv.name}</TableCell>
                <TableCell className="text-table whitespace-normal break-words">{cv.education || "—"}</TableCell>
                <TableCell className="text-table whitespace-normal break-words">{cvs.account?.email}</TableCell>
                <TableCell className="px-0"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="icon" size="actionIcon" aria-label={`Actions for ${cv.name}`}><MoreVertical aria-hidden="true" className="size-5 fill-current" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" variant="actions">
                  <DropdownMenuItem asChild><Link href={`/cvs/${encodeURIComponent(cv.id)}/details`}>View</Link></DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDialog({ type: "edit", cv })}>Update</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDialog({ type: "delete", cv })}>Delete</DropdownMenuItem>
                </DropdownMenuContent></DropdownMenu></TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>
      <CollectionPagination disabled={cvs.loading} page={cvs.page} pageSize={cvs.pageSize} totalPages={cvs.totalPages} onPageChange={cvs.setPage} onPageSizeChange={cvs.changePageSize} />
    </section>
    {dialog && cvs.account && (dialog.type === "delete" ? <DeleteCvDialog cv={dialog.cv} onClose={() => setDialog(null)} onDeleted={saved} /> : dialog.type === "edit" ? <EditCvDialog cvId={dialog.cv.id} userId={cvs.account.id} onClose={() => setDialog(null)} onSaved={saved} /> : <CvFormDialog userId={cvs.account.id} onClose={() => setDialog(null)} onSaved={saved} />)}
  </>;
}
