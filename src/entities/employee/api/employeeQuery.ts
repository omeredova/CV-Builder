import { gql } from "@apollo/client";

import { employeeFields } from "./employeeFields";
import type { UsersQueryItem } from "./employeesQuery";

export interface EmployeeQueryData {
  user: UsersQueryItem | null;
}

export const employeeQuery = gql`
  query Employee($id: ID!) {
    user(userId: $id) {
      ...EmployeeFields
    }
  }
  ${employeeFields}
`;
