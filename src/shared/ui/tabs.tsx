"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";
import { primaryFocusRingClassName } from "@/shared/ui/styles";

export type TabsProps = HTMLAttributes<HTMLDivElement>;

export function Tabs({ className, ...props }: TabsProps) {
  return <div className={cn("w-full", className)} {...props} />;
}

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, onKeyDown, ...props }: TabsListProps) {
  return (
    <div
      className={cn("grid h-full w-full grid-cols-2", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)'));
        const index = tabs.indexOf(event.target as HTMLElement);
        if (index < 0) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next]?.focus();
        tabs[next]?.click();
      }}
      role="tablist"
      {...props}
    />
  );
}

export interface TabsTriggerProps extends ComponentPropsWithoutRef<"button"> {
  active?: boolean;
  asChild?: boolean;
}

export function TabsTrigger({
  active = false,
  asChild = false,
  className,
  ...props
}: TabsTriggerProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={cn(
        "flex h-full items-center justify-center border-b-2 border-transparent text-navigation-tab font-medium uppercase transition-colors hover:text-primary active:border-primary active:text-primary",
        primaryFocusRingClassName,
        active && "border-primary font-semibold text-primary",
        className,
      )}
      role="tab"
      {...props}
    />
  );
}
