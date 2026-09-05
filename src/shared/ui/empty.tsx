import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";

export type EmptyProps = HTMLAttributes<HTMLDivElement>;

export function Empty({ className, ...props }: EmptyProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg p-12 text-center",
        className,
      )}
      data-slot="empty"
      {...props}
    />
  );
}

export type EmptyHeaderProps = HTMLAttributes<HTMLDivElement>;

export function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-2 text-center", className)}
      data-slot="empty-header"
      {...props}
    />
  );
}

export type EmptyMediaProps = HTMLAttributes<HTMLDivElement>;

export function EmptyMedia({ className, ...props }: EmptyMediaProps) {
  return (
    <div
      className={cn("mb-2 flex items-center justify-center [&_svg]:shrink-0", className)}
      data-slot="empty-media"
      {...props}
    />
  );
}

export type EmptyTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return (
    <h1
      className={cn("text-xl font-medium tracking-tight", className)}
      data-slot="empty-title"
      {...props}
    />
  );
}

export type EmptyDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="empty-description"
      {...props}
    />
  );
}

export type EmptyContentProps = HTMLAttributes<HTMLDivElement>;

export function EmptyContent({ className, ...props }: EmptyContentProps) {
  return (
    <div
      className={cn("flex w-full max-w-sm flex-col items-center gap-4", className)}
      data-slot="empty-content"
      {...props}
    />
  );
}
