import type { ReactNode, Ref } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { formatPreviewDate, type CvPreviewDocument } from "../model/preview";

interface PreviewDocumentProps {
  document: CvPreviewDocument;
  documentRef?: Ref<HTMLElement>;
  action?: ReactNode;
}

function Information({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-2"><h3 className="font-medium">{title}</h3>{children}</section>;
}

const columns = "grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]";
const rightColumn = "min-w-0 space-y-5 border-t border-primary pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6";

export function PreviewDocument({ document, documentRef, action }: PreviewDocumentProps) {
  return <article ref={documentRef} aria-label="CV preview" className="space-y-12 text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
    <header className="flex items-start justify-between gap-6">
      <div><h1 className="[font-size:var(--text-profile-name)] leading-tight text-profile-name">{document.fullName || "Name not provided"}</h1>
        {document.position && <p className="mt-1 uppercase">{document.position}</p>}</div>
      {action && <div data-pdf-exclude className="shrink-0">{action}</div>}
    </header>
    <div className={columns}>
      <div className="space-y-5">
        <Information title="Education"><p className="whitespace-pre-line">{document.education || "Not provided"}</p></Information>
        <Information title="Language proficiency">{document.languages.length ? <ul className="space-y-1">{document.languages.map((language) => <li key={language.name}>{language.name} — {language.proficiency}</li>)}</ul> : <p>No languages added</p>}</Information>
        <Information title="Domains"><p>{document.domains.join(", ") || "No domains added"}</p></Information>
      </div>
      <div className={rightColumn}>
        <Information title={document.name}><p className="whitespace-pre-line">{document.description || "No description added"}</p></Information>
        {document.groups.map((group) => <Information key={group.id} title={group.name}><p>{group.skills.map((skill) => skill.name).join(", ")}</p></Information>)}
      </div>
    </div>
    <section className="space-y-6">
      <h2 className="[font-size:var(--text-profile-name)] font-normal text-profile-name">Projects</h2>
      {document.projects.length ? document.projects.map((assignment) => <section key={assignment.id} aria-label={assignment.project.name} className={columns}>
        <div className="space-y-2"><h3 className="font-medium text-primary uppercase">{assignment.project.name}</h3><p className="whitespace-pre-line">{assignment.project.description}</p></div>
        <div className={rightColumn}>
          {assignment.roles.length > 0 && <Information title="Project roles"><p>{assignment.roles.join(", ")}</p></Information>}
          <Information title="Period"><p>{formatPreviewDate(assignment.start_date)} - {assignment.end_date ? formatPreviewDate(assignment.end_date) : "Present"}</p></Information>
          {assignment.responsibilities.some((value) => value.trim()) && <Information title="Responsibilities"><ul className="list-disc space-y-1 pl-5">{assignment.responsibilities.filter((value) => value.trim()).map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul></Information>}
          <Information title="Environment"><p>{assignment.project.environment.join(", ") || "Not provided"}</p></Information>
        </div>
      </section>) : <p>No projects added yet</p>}
    </section>
    <section className="space-y-6">
      <h2 className="[font-size:var(--text-profile-name)] font-normal text-profile-name">Professional skills</h2>
      {document.groups.length ? <Table className="table-fixed" containerClassName="overflow-visible">
        <caption className="sr-only">Skills by category, experience in full years, and last usage year</caption>
        <TableHeader className="[&_tr]:border-primary"><TableRow className="border-primary">
          <TableHead className="w-3/10 px-3 whitespace-normal">Skills category</TableHead><TableHead className="w-3/10 px-3 whitespace-normal">Skill</TableHead>
          <TableHead className="w-1/5 px-3 text-center whitespace-normal">Experience in years</TableHead><TableHead className="w-1/5 px-3 text-center whitespace-normal">Last used</TableHead>
        </TableRow></TableHeader>
        {document.groups.map((group) => <TableBody key={group.id}>
          {group.skills.map((skill, index) => <TableRow key={skill.name} className={index === group.skills.length - 1 ? "border-border" : "border-0"}>
            {index === 0 && <TableHead scope="rowgroup" rowSpan={group.skills.length} className="h-auto px-3 py-3 align-top text-primary whitespace-normal">{group.name}</TableHead>}
            <TableCell className="p-3 font-medium whitespace-normal">{skill.name}</TableCell><TableCell className="p-3 text-center">{skill.years ?? "no experience"}</TableCell><TableCell className="p-3 text-center">{skill.lastUsed ?? "—"}</TableCell>
          </TableRow>)}
        </TableBody>)}
      </Table> : <p>No skills added yet</p>}
    </section>
  </article>;
}
