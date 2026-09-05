import { gql } from "@apollo/client";

export const employeeFields = gql`
  fragment EmployeeFields on User {
    id
    email
    profile { avatar first_name last_name }
    department { id name }
    position { id name }
  }
`;
