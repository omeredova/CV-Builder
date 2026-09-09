import { useQuery } from "@apollo/client/react";
import { cvProjectDetailsQuery, type CvProjectDetailsData, type CvQueryVariables } from "@/entities/cv";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { Skeleton } from "@/shared/ui/skeleton";
import { CvProjectFormDialog } from "./CvProjectFormDialog";

interface UpdateCvProjectDialogProps {
  cvId: string;
  assignmentId: string;
  onClose: () => void;
  onSaved: () => void;
}
export function UpdateCvProjectDialog({ cvId, assignmentId, onClose, onSaved }: UpdateCvProjectDialogProps) {
  const { data, loading, error, refetch } = useQuery<CvProjectDetailsData, CvQueryVariables>(cvProjectDetailsQuery, {
    variables: { cvId }, fetchPolicy: "network-only", context: { skipGlobalLoader: true },
  });
  const assignment = data?.cv?.projects?.find((project) => project.id === assignmentId);
  if (loading || error || !assignment) return <Modal returnFocusId={`cv-project-actions-${assignmentId}`} title="Update project" onClose={onClose}>
    {loading ? <Skeleton role="status" aria-label="Loading project" className="h-48" />
      : error ? <div role="alert"><p>Failed to load project</p><Button variant="secondary" onClick={() => void refetch().catch(() => undefined)}>Retry</Button></div>
      : <p role="status">Project is no longer assigned to this CV</p>}
  </Modal>;
  return <CvProjectFormDialog returnFocusId={`cv-project-actions-${assignmentId}`} key={assignment.id} cvId={cvId} assignment={assignment} onClose={onClose} onSaved={onSaved} />;
}
