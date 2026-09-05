import { gql } from "@apollo/client";

import type { EmploymentOption } from "../model/types";

export interface EmploymentOptionsData {
  options: { items: EmploymentOption[]; total_pages: number };
}

export const departmentsQuery = gql`
  query DepartmentOptions($page: Int!) {
    options: departments(params: { page: $page, limit: 100, sort_by: "name", sort_order: "asc" }) {
      items { id name }
      total_pages
    }
  }
`;

export const positionsQuery = gql`
  query PositionOptions($page: Int!) {
    options: positions(params: { page: $page, limit: 100, sort_by: "name", sort_order: "asc" }) {
      items { id name }
      total_pages
    }
  }
`;
