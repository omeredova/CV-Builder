import type { ReactNode } from "react";

import { Button } from "./button";
import { DialogFooter } from "./dialog";
import { Modal } from "./modal";

export interface ManagementFormDialogProps {
  title: string;
  submitLabel: string;
  saving: boolean;
  submitDisabled: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  children: ReactNode;
}

export function ManagementFormDialog({ title, submitLabel, saving, submitDisabled, error, onClose, onSubmit, children }: ManagementFormDialogProps) {
  return <Modal title={title} onClose={onClose}>
    <form noValidate onSubmit={(event) => { event.preventDefault(); void onSubmit(); }} aria-busy={saving}>
      <div className="space-y-9">{children}</div>
      {error && <p role="alert" className="mt-8 text-sm text-primary">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>CANCEL</Button>
        <Button type="submit" disabled={saving || submitDisabled}>{saving ? "SAVING…" : submitLabel}</Button>
      </DialogFooter>
    </form>
  </Modal>;
}
