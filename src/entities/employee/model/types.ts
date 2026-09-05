export interface Employee {
  avatar: string | null;
  department: string | null;
  departmentId: string | null;
  email: string;
  firstName: string | null;
  id: string;
  lastName: string | null;
  position: string | null;
  positionId: string | null;
}

export type EmployeeSortField = "first_name" | "last_name" | "department" | "position";

export type SortOrder = "asc" | "desc";

export interface EmployeesQueryParams {
  limit: number;
  page: number;
  search?: string;
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
}

export interface PaginatedEmployees {
  employees: readonly Employee[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export type EmploymentField = "department" | "position";

export interface EmploymentOption {
  id: string;
  name: string;
}

export interface EmployeeEmployment {
  id: string;
  department: EmploymentOption | null;
  position: EmploymentOption | null;
}

export interface EmploymentUpdate {
  userId: string;
  departmentId: string;
  positionId: string;
}
