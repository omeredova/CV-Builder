import { gql } from "@apollo/client";

export interface EmployeeRoleQueryData {
  user: { id: string; role: string } | null;
}

export interface EmployeeRoleQueryVariables {
  userId: string;
}

export const employeeRoleQuery = gql`
  query EmployeeRole($userId: ID!) {
    user(userId: $userId) {
      id
      role
    }
  }
`;
