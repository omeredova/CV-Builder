import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

import { cn } from "@/shared/lib/class-names";

export type TableProps = TableHTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-x-auto" data-slot="table-container">
      <table className={cn("w-full caption-bottom text-sm", className)} data-slot="table" {...props} />
    </div>
  );
}

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      className={cn("[&_tr]:border-b [&_tr]:border-table-border", className)}
      data-slot="table-header"
      {...props}
    />
  );
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      data-slot="table-body"
      {...props}
    />
  );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn("border-b border-border transition-colors", className)}
      data-slot="table-row"
      {...props}
    />
  );
}

export type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement>;

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "h-table-header px-table-cell text-left align-middle text-table font-medium text-foreground whitespace-nowrap",
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      className={cn("p-table-cell align-middle whitespace-nowrap", className)}
      data-slot="table-cell"
      {...props}
    />
  );
}
