import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";

export type TabsProps = HTMLAttributes<HTMLDivElement>;

export function Tabs({ className, ...props }: TabsProps) {
  return <div className={cn("w-full", className)} {...props} />;
}

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      className={cn("grid h-full w-full grid-cols-2", className)}
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
      className={cn(
        "flex h-full items-center justify-center border-b-2 border-transparent text-sm font-bold uppercase outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary active:border-primary active:text-primary",
        active && "border-primary text-primary",
        className,
      )}
      role="tab"
      {...props}
    />
  );
}
