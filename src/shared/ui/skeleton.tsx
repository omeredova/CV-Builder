import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/class-names";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-sidebar-accent motion-reduce:animate-none", className)} {...props} />;
}
