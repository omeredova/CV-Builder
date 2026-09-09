import type { ReactNode } from "react";

import { Button } from "./button";
import { Empty, EmptyHeader, EmptyTitle } from "./empty";

export interface CollectionContentProps {
  loading: boolean;
  failed: boolean;
  empty: boolean;
  loadingLabel: string;
  loadingContent: ReactNode;
  errorMessage: string;
  retryLabel: string;
  emptyMessage: string;
  onRetry: () => Promise<unknown>;
  children: ReactNode;
  actions?: ReactNode;
}

export function CollectionContent({
  loading, failed, empty, loadingLabel, loadingContent, errorMessage, retryLabel,
  emptyMessage, onRetry, children, actions,
}: CollectionContentProps) {
  if (loading) return <div role="status" aria-label={loadingLabel}>
    {loadingContent}
  </div>;

  if (failed) return <div className="grid min-h-64 content-center justify-items-center gap-4">
    <p role="alert">{errorMessage}</p>
    <Button variant="secondary" onClick={() => { void onRetry().catch(() => undefined); }}>{retryLabel}</Button>
  </div>;

  return <>
    {empty ? (
      <Empty className="min-h-20">
        <EmptyHeader><EmptyTitle className="text-base font-normal">{emptyMessage}</EmptyTitle></EmptyHeader>
      </Empty>
    ) : children}
    {actions}
  </>;
}
