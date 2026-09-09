"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/class-names";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({ className, align = "start", sideOffset = 0, ...props }: ComponentProps<typeof PopoverPrimitive.Content>) {
  return <PopoverPrimitive.Portal><PopoverPrimitive.Content
    data-slot="popover-content" align={align} sideOffset={sideOffset}
    className={cn("z-[60] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto border border-muted-foreground bg-background text-foreground shadow-md outline-none", className)} {...props}
  /></PopoverPrimitive.Portal>;
}
