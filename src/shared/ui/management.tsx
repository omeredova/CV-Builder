import type { ReactNode } from "react";

import { Button } from "./button";
import { DialogFooter } from "./dialog";
import { Modal } from "./modal";

export interface ManagementRemoval {
  active: boolean;
  confirming: boolean;
  count: number;
  pending: boolean;
  error?: string;
  actionLabel: string;
  title: string;
  description: ReactNode;
  onCancel: () => void;
  onOpenConfirmation: () => void;
  onCloseConfirmation: () => void;
  onConfirm: () => Promise<void>;
}

export interface ManagementProps {
  empty: boolean;
  emptyMessage: string;
  actions: ReactNode;
  form: ReactNode;
  removal: ManagementRemoval;
  children: ReactNode;
}

export function Management({ empty, emptyMessage, actions, form, removal, children }: ManagementProps) {
  return <>
    {empty ? <p className="py-8 text-center text-base">{emptyMessage}</p> : children}
    {removal.active ? <div className="mt-8 flex flex-wrap justify-end gap-6">
      <Button type="button" variant="secondary" onClick={removal.onCancel} disabled={removal.pending}>CANCEL</Button>
      <Button type="button" className="gap-4" aria-label={`${removal.actionLabel} (${removal.count})`}
        onClick={removal.onOpenConfirmation} disabled={!removal.count || removal.pending}>
        {removal.actionLabel}
        {removal.count > 0 && <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-on-primary text-xs leading-none font-medium text-primary">{removal.count}</span>}
      </Button>
    </div> : actions}
    {removal.active && !removal.confirming && removal.error && <p role="alert" className="mt-4 text-sm text-primary">{removal.error}</p>}
    {form}
    {removal.active && removal.confirming && <Modal title={removal.title} description={removal.description} onClose={removal.onCloseConfirmation}>
      {removal.error && <p role="alert" className="text-sm text-primary">{removal.error}</p>}
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={removal.onCloseConfirmation}>CANCEL</Button>
        <Button type="button" disabled={removal.pending || !removal.count} aria-busy={removal.pending}
          onClick={() => { void removal.onConfirm(); }}>{removal.pending ? "REMOVING…" : "CONFIRM"}</Button>
      </DialogFooter>
    </Modal>}
  </>;
}
