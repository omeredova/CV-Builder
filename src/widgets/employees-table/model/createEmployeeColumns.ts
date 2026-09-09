import type { ReactNode } from "react";

import type { Employee, EmployeeSortField } from "@/entities/employee";

export interface EmployeeColumn {
  key: string;
  label?: string;
  render: (employee: Employee) => ReactNode;
  sortField?: EmployeeSortField;
  widthClassName: string;
}

export interface EmployeeColumnRenderers {
  renderActions?: (employee: Employee) => ReactNode;
  renderAvatar?: (employee: Employee) => ReactNode;
}

export function createEmployeeColumns({
  renderActions,
  renderAvatar,
}: EmployeeColumnRenderers): readonly EmployeeColumn[] {
  return [
    {
      key: "avatar",
      render: (employee) => renderAvatar?.(employee),
      widthClassName: "w-table-column-avatar",
    },
    {
      key: "firstName",
      label: "First Name",
      sortField: "first_name",
      render: (employee) => employee.firstName,
      widthClassName: "w-table-column-first-name",
    },
    {
      key: "lastName",
      label: "Last Name",
      sortField: "last_name",
      render: (employee) => employee.lastName,
      widthClassName: "w-table-column-last-name",
    },
    {
      key: "email",
      label: "Email",
      render: (employee) => employee.email,
      widthClassName: "w-table-column-email",
    },
    {
      key: "department",
      label: "Department",
      sortField: "department",
      render: (employee) => employee.department,
      widthClassName: "w-table-column-department",
    },
    {
      key: "position",
      label: "Position",
      sortField: "position",
      render: (employee) => employee.position,
      widthClassName: "w-table-column-position",
    },
    {
      key: "actions",
      render: (employee) => renderActions?.(employee),
      widthClassName: "w-table-column-actions",
    },
  ];
}
