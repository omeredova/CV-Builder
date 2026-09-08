"use client";

import { useQuery } from "@apollo/client/react";
import { cvQuery, type CvQueryData, type CvQueryVariables } from "@/entities/cv";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { Skeleton } from "@/shared/ui/skeleton";
import { CvFormDialog } from "./CvFormDialog";

interface EditCvDialogProps { cvId: string; userId: string; onClose: () => void; onSaved: () => void }

export function EditCvDialog({ cvId, userId, onClose, onSaved }: EditCvDialogProps) {
  const { data, loading, error, refetch } = useQuery<CvQueryData, CvQueryVariables>(cvQuery, {
    variables: { cvId }, context: { skipGlobalLoader: true },
  });
  if (!loading && !error && data?.cv?.user?.id === userId) {
    return <CvFormDialog cv={data.cv} userId={userId} onClose={onClose} onSaved={onSaved} />;
  }
  return <Modal title="Update CV" onClose={onClose}>
    {loading ? <Skeleton role="status" aria-label="Loading CV" className="h-36 w-full" />
      : error ? <div role="alert"><p>Failed to load CV</p><Button variant="secondary" onClick={() => { void refetch().catch(() => undefined); }}>Retry</Button></div>
      : <p role="status">CV not found</p>}
  </Modal>;
}
