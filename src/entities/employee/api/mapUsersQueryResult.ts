import type { Employee, PaginatedEmployees } from "../model/types";
import type { UsersQueryItem, UsersQueryResult } from "./employeesQuery";

export function mapUserToEmployee(user: UsersQueryItem): Employee {
  return {
    avatar: user.profile.avatar,
    department: user.department?.name ?? null,
    departmentId: user.department?.id ?? null,
    email: user.email,
    firstName: user.profile.first_name,
    id: user.id,
    lastName: user.profile.last_name ?? null,
    position: user.position?.name ?? null,
    positionId: user.position?.id ?? null,
  };
}

export function mapUsersQueryResult(users: UsersQueryResult): PaginatedEmployees {
  return {
    employees: users.items.map(mapUserToEmployee),
    limit: users.limit,
    page: users.page,
    total: users.total,
    totalPages: users.total_pages,
  };
}
