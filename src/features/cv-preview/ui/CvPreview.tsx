import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { useCvPreview } from "../model/useCvPreview";
import { PreviewDocument } from "./PreviewDocument";

interface CvPreviewProps { cvId: string; ownerId: string }

export function CvPreview({ cvId, ownerId }: CvPreviewProps) {
  const preview = useCvPreview(cvId, ownerId);
  const action = <Button variant="outline" className="w-button-width border-primary text-primary" disabled={!preview.document || preview.exporting} onClick={() => void preview.handleExport()}>{preview.exporting ? "Exporting…" : "Export PDF"}</Button>;
  return <>
    {!preview.document && <div className="mb-6 flex justify-end">{action}</div>}
    {preview.loading ? <Skeleton className="h-96 w-full" role="status" aria-label="Loading CV preview" />
      : preview.error ? <div role="alert"><p>Failed to load CV preview</p><Button variant="secondary" className="mt-4" onClick={preview.retry}>Retry</Button></div>
      : !preview.document ? <p role="status">CV preview is not available</p>
      : <PreviewDocument document={preview.document} documentRef={preview.documentRef} action={action} />}
    {preview.exportError && <p role="alert" className="mt-4 text-primary">Failed to export PDF. Please try again.</p>}
  </>;
}
