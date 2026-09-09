"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/class-names";

export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogContent({ className, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-loader-overlay" />
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn("fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-3rem)] w-dialog-width max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible border-0 bg-dialog px-6 py-4 text-foreground shadow-primary outline-none", className)}
      {...props}
    />
  </DialogPrimitive.Portal>;
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("mb-6.5 flex items-center justify-between gap-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-xl leading-6 font-medium", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("mb-8 text-base font-normal text-foreground", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("mt-6 flex flex-wrap justify-end gap-6", className)} {...props} />;
}
