import type { MouseEvent } from "react";

import { cn } from "@/shared/lib/class-names";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { ChevronRightIcon } from "@/shared/ui/icons/ChevronRightIcon";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/shared/ui/pagination";
import { primaryFocusRingClassName } from "@/shared/ui/styles";
import { createPaginationTokens } from "../model/createPaginationTokens";

interface EmployeesPaginationProps {
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  totalPages: number;
}

export function EmployeesPagination({ disabled = false, onPageChange, onPageSizeChange, page, pageSize, pageSizeOptions = [10, 20, 50], totalPages }: EmployeesPaginationProps) {
  const tokens = createPaginationTokens(page, totalPages);
  const changePage = (event: MouseEvent<HTMLAnchorElement>, nextPage: number) => {
    event.preventDefault();
    if (!disabled && nextPage >= 1 && nextPage <= totalPages) onPageChange(nextPage);
  };

  return (
    <Pagination className="my-pagination-block-offset h-compact-control max-w-pagination-width justify-between">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious aria-disabled={disabled || page <= 1} className={cn((disabled || page <= 1) && "pointer-events-none opacity-40")} href="#" onClick={(event) => changePage(event, page - 1)} tabIndex={disabled || page <= 1 ? -1 : undefined} />
        </PaginationItem>
        {tokens.map((token, index) => (
          <PaginationItem key={token === "ellipsis" ? `ellipsis-${index}` : token}>
            {token === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink aria-disabled={disabled} aria-label={`Page ${token}`} className={cn(disabled && "pointer-events-none opacity-40")} href="#" isActive={token === page} onClick={(event) => changePage(event, token)} tabIndex={disabled ? -1 : undefined}>
                {token}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext aria-disabled={disabled || page >= totalPages} className={cn((disabled || page >= totalPages) && "pointer-events-none opacity-40")} href="#" onClick={(event) => changePage(event, page + 1)} tabIndex={disabled || page >= totalPages ? -1 : undefined} />
        </PaginationItem>
      </PaginationContent>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button aria-label={`Rows per page: ${pageSize}`} className={`flex h-compact-control w-pagination-page-size items-center justify-between border border-pagination-border px-pagination-page-size-inline text-pagination-text hover:bg-sidebar-accent disabled:pointer-events-none disabled:opacity-40 ${primaryFocusRingClassName}`} disabled={disabled} type="button">
            {pageSize}
            <ChevronRightIcon className="h-chevron-height w-chevron-width rotate-90 text-pagination-icon" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-pagination-page-size">
          {pageSizeOptions.map((option) => <DropdownMenuItem key={option} onSelect={() => onPageSizeChange(option)}>{option}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
    </Pagination>
  );
}
