import type { ReactNode } from "react";

import { Button } from "./button";
import { DialogFooter } from "./dialog";
import { Modal } from "./modal";

export interface ConfirmationDialogProps {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  pendingLabel: string;
  pending: boolean;
  confirmDisabled?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmationDialog({ title, description, confirmLabel = "CONFIRM", pendingLabel, pending, confirmDisabled = false, error, onClose, onConfirm }: ConfirmationDialogProps) {
  return <Modal title={title} description={description} onClose={() => { if (!pending) onClose(); }}>
    {error && <p role="alert" className="text-sm text-primary">{error}</p>}
    <DialogFooter>
      <Button type="button" variant="secondary" disabled={pending} onClick={onClose}>CANCEL</Button>
      <Button type="button" disabled={pending || confirmDisabled} aria-busy={pending}
        onClick={() => { void onConfirm(); }}>{pending ? pendingLabel : confirmLabel}</Button>
    </DialogFooter>
  </Modal>;
}
