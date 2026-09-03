import { Search } from "lucide-react";

import type { Employee } from "@/entities/employee";
import { Input, type InputProps } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import {
  createEmployeeColumns,
  type EmployeeColumnRenderers,
} from "../model/createEmployeeColumns";

export interface EmployeesTableProps extends EmployeeColumnRenderers {
  employees: readonly Employee[];
  searchProps?: Omit<InputProps, "type">;
}

export function EmployeesTable({
  employees,
  renderActions,
  renderAvatar,
  searchProps,
}: EmployeesTableProps) {
  const columns = createEmployeeColumns({ renderActions, renderAvatar });

  return (
    <section aria-label="Employees table" className="mt-table-offset">
      <div className="relative mb-table-search-gap ml-table-search-margin h-table-search w-table-search-width">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-table-search-icon top-1/2 size-table-search-icon-size -translate-y-1/2 text-muted-foreground"
        />
        <Input
          {...searchProps}
          aria-label="Search employees"
          className="h-full rounded-control border-border py-0 pr-table-search-inline pl-table-search-text text-base text-foreground placeholder:text-foreground"
          placeholder="Search"
          type="search"
        />
      </div>

      <div className="w-table-width max-w-full">
        <Table className="table-fixed">
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
          <TableHeader className="[&_tr]:border-0">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
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
                    <TableCell className="text-table text-foreground" key={column.key}>
                      {column.render(employee)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
