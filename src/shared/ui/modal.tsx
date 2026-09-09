"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";

import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

export interface ModalProps {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  returnFocusId?: string;
}

export function Modal({ title, description, onClose, children, className, returnFocusId }: ModalProps) {
  const descriptionId = useId();
  const trigger = useRef<Element | null>(null);

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent
      className={className}
      aria-describedby={description ? descriptionId : undefined}
      onOpenAutoFocus={() => { trigger.current = document.activeElement; }}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        const target = returnFocusId ? document.getElementById(returnFocusId) : trigger.current;
        if (target instanceof HTMLElement && target.isConnected) target.focus();
      }}
      onInteractOutside={(event) => event.preventDefault()}
      onEscapeKeyDown={(event) => {
        if (event.target instanceof Element && event.target.closest('[role="dialog"]')?.querySelector('[role="combobox"][aria-expanded="true"]')) event.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogClose asChild>
          <Button type="button" variant="link" size="content" aria-label={`Close ${title.toLowerCase()}`} className="size-6 shrink-0 text-muted-foreground">
            <X aria-hidden="true" className="size-5" />
          </Button>
        </DialogClose>
      </DialogHeader>
      {description && <DialogDescription id={descriptionId}>{description}</DialogDescription>}
      {children}
    </DialogContent>
  </Dialog>;
}
