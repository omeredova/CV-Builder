import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/class-names";
import { buttonVariants, type ButtonProps } from "@/shared/ui/button";
import { ChevronRightIcon } from "@/shared/ui/icons/ChevronRightIcon";

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav aria-label="pagination" className={cn("mx-auto flex w-full items-center justify-center", className)} data-slot="pagination" role="navigation" {...props} />
  );
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-pagination-item-gap", className)} data-slot="pagination-content" {...props} />;
}

export function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

export type PaginationLinkProps = {
  appearance?: "arrow" | "page";
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  ComponentProps<"a">;

export function PaginationLink({
  appearance = "page",
  className,
  isActive,
  size = "pagination",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          size,
          variant: appearance === "arrow" ? "paginationArrow" : "pagination",
        }),
        className,
      )}
      data-active={isActive}
      data-slot="pagination-link"
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink {...props} appearance="arrow" aria-label="Go to previous page" className={className}>
      <ChevronRightIcon aria-hidden="true" className="rotate-180" />
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink {...props} appearance="arrow" aria-label="Go to next page" className={className}>
      <ChevronRightIcon aria-hidden="true" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span aria-hidden="true" className={cn("flex size-compact-control items-center justify-center text-sm font-normal text-pagination-text", className)} data-slot="pagination-ellipsis" {...props}>
      <span aria-hidden="true">…</span>
      <span className="sr-only">More pages</span>
    </span>
  );
}
