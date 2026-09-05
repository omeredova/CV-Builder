import { gql } from "@apollo/client";
import { employeeFields } from "./employeeFields";

import type {
  EmployeeSortField,
  EmployeesQueryParams,
  SortOrder,
} from "../model/types";

export interface UsersQueryItem {
  department: { id: string; name: string } | null;
  email: string;
  id: string;
  position: { id: string; name: string } | null;
  profile: {
    avatar: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface UsersQueryResult {
  items: UsersQueryItem[];
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface UsersQueryData {
  users: UsersQueryResult;
}

export interface UsersQueryVariables {
  params: {
    limit: number;
    page: number;
    search?: string;
    sort_by?: EmployeeSortField;
    sort_order?: SortOrder;
  };
}

export function createUsersQueryVariables(params: EmployeesQueryParams): UsersQueryVariables {
  const search = params.search?.trim();

  return {
    params: {
      limit: params.limit,
      page: params.page,
      ...(search ? { search } : {}),
      ...(params.sortBy ? { sort_by: params.sortBy } : {}),
      ...(params.sortOrder ? { sort_order: params.sortOrder } : {}),
    },
  };
}

export const employeesQuery = gql`
  query Employees($params: SearchPaginationInput) {
    users(params: $params) {
      items {
        ...EmployeeFields
      }
      total
      page
      limit
      total_pages
    }
  }
  ${employeeFields}
`;
