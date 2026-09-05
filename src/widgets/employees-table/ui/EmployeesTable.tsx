import { ArrowDown, ArrowUp, Search } from "lucide-react";

import type { Employee, EmployeeSortField, SortOrder } from "@/entities/employee";
import { Button } from "@/shared/ui/button";
import { Input, type InputProps } from "@/shared/ui/input";
import { primaryFocusRingClassName } from "@/shared/ui/styles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import {
  createEmployeeColumns,
  type EmployeeColumnRenderers,
} from "../model/createEmployeeColumns";
import { EmployeesPagination } from "./EmployeesPagination";

export interface EmployeesTableProps extends EmployeeColumnRenderers {
  employees: readonly Employee[];
  errorMessage?: string;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRetry?: () => void;
  onSortChange?: (field: EmployeeSortField) => void;
  page?: number;
  pageSize?: number;
  searchProps?: Omit<InputProps, "type">;
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
  totalPages?: number;
}

export function EmployeesTable({
  employees,
  errorMessage,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSortChange,
  page = 1,
  pageSize = 10,
  renderActions,
  renderAvatar,
  searchProps,
  sortBy,
  sortOrder,
  totalPages = 1,
}: EmployeesTableProps) {
  const columns = createEmployeeColumns({ renderActions, renderAvatar });

  return (
    <section
      aria-label="Employees table"
      className="mx-auto mt-table-offset w-full max-w-table-container-width px-table-page-inline max-table-compact:[&_[data-column=email]]:hidden max-table-compact:[&_[data-column=position]]:hidden dashboard:max-w-none"
    >
      <div className="relative mb-table-search-gap ml-table-search-margin h-table-search w-table-search-width min-w-table-search-min-width max-w-[calc(100%-var(--spacing-table-search-max-offset))]">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-table-search-icon top-1/2 size-table-search-icon-size -translate-y-1/2 text-table-search-icon"
        />
        <Input
          {...searchProps}
          aria-label="Search employees"
          className="h-full rounded-control border-border py-0 pr-table-search-inline pl-table-search-text text-base text-foreground placeholder:text-table-search-placeholder"
          placeholder="Search"
          type="search"
        />
      </div>

      <div className="w-full">
        <Table className="table-fixed" containerClassName="overflow-x-hidden">
          <colgroup>
            {columns.map((column) => (
              <col className={column.widthClassName} data-column={column.key} key={column.key} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead data-column={column.key} key={column.key}>
                  {column.sortField && onSortChange ? (
                    <button
                      aria-label={`Sort by ${column.label}`}
                      className={`inline-flex items-center gap-1 rounded-sm ${primaryFocusRingClassName}`}
                      onClick={() => onSortChange(column.sortField!)}
                      type="button"
                    >
                      {column.label}
                      {sortBy === column.sortField &&
                        (sortOrder === "desc" ? (
                          <ArrowDown aria-hidden="true" className="size-4" />
                        ) : (
                          <ArrowUp aria-hidden="true" className="size-4" />
                        ))}
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorMessage ? (
              <TableRow className="h-table-empty !border-y border-table-border">
                <TableCell className="text-center text-table text-foreground" colSpan={columns.length}>
                  <p>{errorMessage}</p>
                  {onRetry && (
                    <Button className="mt-4" onClick={onRetry} type="button" variant="secondary">
                      Retry
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow className="h-table-empty !border-y border-table-border">
                <TableCell
                  className="text-center text-table font-normal text-foreground"
                  colSpan={columns.length}
                >
                  No results
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow className="h-table-header border-table-border" key={employee.id}>
                  {columns.map((column) => (
                    <TableCell
                      className="text-table text-foreground"
                      data-column={column.key}
                      key={column.key}
                    >
                      {column.render(employee)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && onPageChange && onPageSizeChange && (
        <EmployeesPagination
          disabled={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}
