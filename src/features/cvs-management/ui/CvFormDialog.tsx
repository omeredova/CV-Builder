"use client";

import type { Cv } from "@/entities/cv";
import { ManagementFormDialog } from "@/shared/ui/management-form-dialog";
import { useCvForm } from "../model/useCvForm";
import { CvFormFields } from "./CvFormFields";

interface CvFormDialogProps { cv?: Cv; userId: string; onClose: () => void; onSaved: () => void }
export function CvFormDialog({ cv, userId, onClose, onSaved }: CvFormDialogProps) {
  const form = useCvForm(cv, userId, onSaved);
  return <ManagementFormDialog title={cv ? "Update CV" : "Create CV"} submitLabel={cv ? "SAVE" : "CREATE"}
    saving={form.loading} submitDisabled={!form.valid} error={form.error}
    onClose={() => { if (!form.loading) onClose(); }} onSubmit={form.submit}>
    <CvFormFields form={form} />
  </ManagementFormDialog>;
}
