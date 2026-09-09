import { useId } from "react";
import type { CvProjectDetails } from "@/entities/cv";
import { Button } from "@/shared/ui/button";
import { DatePicker } from "@/shared/ui/date-picker";
import { DialogFooter } from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Textarea } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { Multiselect } from "@/shared/ui/multiselect";
import { Select } from "@/shared/ui/select";
import { useCvProjectForm } from "../model/useCvProjectForm";

interface CvProjectFormDialogProps {
  cvId: string;
  assignment?: CvProjectDetails;
  returnFocusId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function CvProjectFormDialog({ cvId, onClose, onSaved, assignment, returnFocusId }: CvProjectFormDialogProps) {
  const form = useCvProjectForm(cvId, onSaved, assignment);
  const id = useId();
  const project = form.selectedProject;
  return <Modal returnFocusId={returnFocusId} title={form.editing ? "Update project" : "Add project"} onClose={() => { if (!form.loading) onClose(); }} className="w-[64rem] overflow-y-auto">
    <form noValidate aria-busy={form.loading} onSubmit={(event) => { event.preventDefault(); void form.submit(); }}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
        <div>
          <Select label="Name" required value={form.values.projectId} options={form.projects.map((item) => ({ value: item.id, label: item.name }))} onValueChange={form.selectProject} disabled={form.loading || form.editing} loading={form.catalogLoading} hasMore={form.hasMore} onLoadMore={() => void form.loadMore()} error={form.fieldError("projectId")} loadError={form.catalogError} />
          {form.catalogError && <Button type="button" variant="link" onClick={form.retryCatalog}>Retry projects</Button>}
        </div>
        <FormField label="Domain" labelPlacement="above" containerClassName="w-full" disabled value={project?.domain ?? ""} placeholder="Domain" />
        <DatePicker label="Start Date" required value={form.values.start_date} min={project?.start_date} max={project?.end_date ?? undefined} disabled={!project || form.loading} error={form.fieldError("start_date")} onBlur={() => form.blur("start_date")} onValueChange={(value) => form.change("start_date", value)} />
        <DatePicker label="End Date" value={form.values.end_date} min={form.values.start_date || project?.start_date} max={project?.end_date ?? undefined} disabled={!project || form.loading} error={form.fieldError("end_date")} onBlur={() => form.blur("end_date")} onValueChange={(value) => form.change("end_date", value)} />
        <div className="md:col-span-2">
          <Label htmlFor={`${id}-description`} className="mb-field-label-gap block pl-field-inline text-xs text-muted-foreground">Description</Label>
          <Textarea id={`${id}-description`} disabled value={project?.description ?? ""} placeholder="Description" className="min-h-24" />
        </div>
        <div className="md:col-span-2"><Multiselect label="Environment" disabled value={project?.environment ?? []} options={(project?.environment ?? []).map((value) => ({ value, label: value }))} onValueChange={() => undefined} /></div>
        <div className="md:col-span-2">
          <Multiselect label="Roles" required value={form.values.roles} options={form.roles.map((role) => ({ value: role.name, label: role.name }))} disabled={form.loading || form.rolesLoading || !!form.rolesError} error={form.fieldError("roles")} onValueChange={(value) => form.change("roles", value)} />
          {form.rolesLoading && <p role="status" className="mt-2 text-sm text-muted-foreground">Loading roles…</p>}
          {form.rolesError && <div role="alert"><p>{form.rolesError}</p><Button type="button" variant="link" onClick={form.retryRoles}>Retry roles</Button></div>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor={`${id}-responsibilities`} className="mb-field-label-gap block pl-field-inline text-xs text-muted-foreground">Responsibilities</Label>
          <Textarea id={`${id}-responsibilities`} aria-describedby={`${id}-responsibilities-hint`} placeholder="Responsibilities" value={form.values.responsibilities} disabled={form.loading} onChange={(event) => form.change("responsibilities", event.target.value)} className="min-h-24" />
          <p id={`${id}-responsibilities-hint`} className="mt-2 pl-field-inline text-xs text-muted-foreground">Enter one responsibility per line.</p>
        </div>
      </div>
      {form.error && <p role="alert" className="mt-6 text-sm text-primary">{form.error}</p>}
      <DialogFooter><Button type="button" variant="secondary" disabled={form.loading} onClick={onClose}>CANCEL</Button><Button type="submit" variant="primary" disabled={!form.valid || form.loading}>{form.loading ? form.editing ? "UPDATING…" : "ADDING…" : form.editing ? "UPDATE" : "ADD"}</Button></DialogFooter>
    </form>
  </Modal>;
}
