"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/class-names";

export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

export function DropdownMenuTrigger(
  props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function DropdownMenuContent({
  className,
  sideOffset = 0,
  variant = "default",
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content> & { variant?: "default" | "actions" }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn("z-50 outline-none", variant === "actions" && "w-action-menu-width overflow-hidden rounded-lg border border-border bg-sidebar-accent py-0 text-sm font-normal text-foreground [&_[data-slot=dropdown-menu-item]]:flex [&_[data-slot=dropdown-menu-item]]:h-8 [&_[data-slot=dropdown-menu-item]]:cursor-pointer [&_[data-slot=dropdown-menu-item]]:items-center [&_[data-slot=dropdown-menu-item]]:px-3.5 [&_[data-slot=dropdown-menu-item]]:data-[highlighted]:bg-select-hover [&_[data-slot=dropdown-menu-item]]:data-[highlighted]:text-select-hover-foreground [&_[data-slot=dropdown-menu-item]]:data-[disabled]:pointer-events-none [&_[data-slot=dropdown-menu-item]]:data-[disabled]:text-disabled", className)}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn("outline-none", className)}
      data-slot="dropdown-menu-item"
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("h-px bg-sidebar-footer-menu-border", className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  );
}
