import { useMutation, useQuery } from "@apollo/client/react";
import { useRef, useState } from "react";
import type { CvQueryData, CvQueryVariables } from "@/entities/cv";
import { skillCategoriesQuery, type SkillCategoriesQueryData } from "@/entities/skill";
import { cvPreviewQuery, exportPdfMutation, type PreviewCv } from "../api/previewOperations";
import { createPreview } from "./preview";
import { createPdfHtml, downloadPdf } from "./exportPdf";

export function useCvPreview(cvId: string, ownerId: string) {
  const documentRef = useRef<HTMLElement>(null);
  const exportingRef = useRef(false);
  const [exportError, setExportError] = useState(false);
  const preview = useQuery<CvQueryData<PreviewCv>, CvQueryVariables>(cvPreviewQuery, {
    variables: { cvId }, fetchPolicy: "cache-first", context: { skipGlobalLoader: true },
  });
  const cv = preview.data?.cv?.user?.id === ownerId ? preview.data.cv : undefined;
  const categories = useQuery<SkillCategoriesQueryData>(skillCategoriesQuery, {
    skip: !cv, context: { skipGlobalLoader: true },
  });
  const [exportPdf, { loading: exporting }] = useMutation<{ exportPdf: string }, { pdf: { html: string; margin: { top: string; bottom: string; left: string; right: string } } }>(exportPdfMutation, { context: { skipGlobalLoader: true } });
  const loading = preview.loading || categories.loading;
  const error = preview.error || categories.error;
  const document = cv && categories.data && !loading && !error ? createPreview(cv, categories.data.skillCategories, new Date()) : null;

  async function handleExport(): Promise<void> {
    if (!document || !documentRef.current || exportingRef.current) return;
    exportingRef.current = true;
    setExportError(false);
    try {
      const result = await exportPdf({ variables: { pdf: {
        html: createPdfHtml(documentRef.current),
        margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
      } } });
      if (!result.data?.exportPdf) throw new Error("Missing PDF");
      downloadPdf(result.data.exportPdf, document.name);
    } catch {
      setExportError(true);
    } finally {
      exportingRef.current = false;
    }
  }

  function retry(): void {
    void (preview.error ? preview.refetch() : categories.refetch()).catch(() => undefined);
  }

  return { document, documentRef, loading, error, retry, exporting, exportError, handleExport };
}
