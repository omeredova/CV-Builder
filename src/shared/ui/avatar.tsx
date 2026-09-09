import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";

export type AvatarProps = HTMLAttributes<HTMLDivElement>;

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex size-avatar shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary font-medium text-sidebar-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}

export type AvatarFallbackProps = HTMLAttributes<HTMLSpanElement>;

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return <span className={cn("flex size-full items-center justify-center", className)} {...props} />;
}
