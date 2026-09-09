"use client";

import { Command as CommandPrimitive } from "cmdk";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/class-names";

export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn("flex w-full flex-col overflow-hidden bg-background text-foreground", className)} {...props} />;
}
export function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  return <CommandPrimitive.Input className={cn("h-control-height w-full border-b border-border bg-transparent px-field-inline text-sm outline-none placeholder:text-placeholder", className)} {...props} />;
}
export function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn("max-h-60 overflow-y-auto overflow-x-hidden", className)} {...props} />;
}
export function CommandEmpty(props: ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="px-field-inline py-3 text-sm text-muted-foreground" {...props} />;
}
export function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className={cn("relative flex min-h-control-height cursor-pointer select-none items-center gap-2 px-field-inline text-sm outline-none data-[selected=true]:bg-select-hover data-[selected=true]:text-select-hover-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50", className)} {...props} />;
}
