import type { ReactNode } from "react";

import type { Employee } from "@/entities/employee";

export interface EmployeeColumn {
  key: string;
  label?: string;
  render: (employee: Employee) => ReactNode;
  width: number;
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
    { key: "avatar", render: (employee) => renderAvatar?.(employee), width: 80 },
    {
      key: "firstName",
      label: "First Name",
      render: (employee) => employee.firstName,
      width: 177,
    },
    {
      key: "lastName",
      label: "Last Name",
      render: (employee) => employee.lastName,
      width: 174,
    },
    { key: "email", label: "Email", render: (employee) => employee.email, width: 320 },
    {
      key: "department",
      label: "Department",
      render: (employee) => employee.department,
      width: 163,
    },
    {
      key: "position",
      label: "Position",
      render: (employee) => employee.position,
      width: 203,
    },
    { key: "actions", render: (employee) => renderActions?.(employee), width: 72 },
  ];
}
