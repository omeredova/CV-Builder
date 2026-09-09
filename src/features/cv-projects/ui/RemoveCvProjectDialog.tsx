import type { CvProject } from "@/entities/cv";
import { ConfirmationDialog } from "@/shared/ui/confirmation-dialog";
import { useRemoveCvProject } from "../model/useRemoveCvProject";

interface RemoveCvProjectDialogProps {
  cvId: string;
  project: Pick<CvProject, "id" | "name">;
  onClose: () => void;
  onRemoved: () => void;
}

export function RemoveCvProjectDialog({ cvId, project, onClose, onRemoved }: RemoveCvProjectDialogProps) {
  const { pending, error, confirm } = useRemoveCvProject(cvId, project.id, onRemoved);
  return <ConfirmationDialog title="Remove CV project"
    description={<>Are you sure you want to remove project <strong className="font-bold">{project.name}</strong>?</>}
    returnFocusId={`cv-project-actions-${project.id}`}
    pending={pending} pendingLabel="REMOVING…" error={error} onClose={onClose} onConfirm={confirm} />;
}
