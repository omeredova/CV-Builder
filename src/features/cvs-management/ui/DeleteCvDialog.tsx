"use client";

import type { Cv } from "@/entities/cv";
import { ConfirmationDialog } from "@/shared/ui/confirmation-dialog";

import { useDeleteCv } from "../model/useDeleteCv";

interface DeleteCvDialogProps { cv: Pick<Cv, "id" | "name">; onClose: () => void; onDeleted: () => void }
export function DeleteCvDialog({ cv, onClose, onDeleted }: DeleteCvDialogProps) {
  const { loading, error, confirm } = useDeleteCv(cv.id, onDeleted);
  return <ConfirmationDialog
    title="Delete CV" description={<>Are you sure you want to delete CV <strong>{cv.name}</strong>?</>}
    pending={loading} pendingLabel="DELETING…" onClose={onClose} onConfirm={confirm}
    error={error ? "Failed to delete CV. Please try again." : undefined} />;
}
