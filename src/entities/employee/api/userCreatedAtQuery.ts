import { gql } from "@apollo/client";

export interface UserCreatedAtQueryData {
  user: {
    id: string;
    created_at: string;
  } | null;
}

export interface UserCreatedAtQueryVariables {
  id: string;
}

export const userCreatedAtQuery = gql`
  query UserCreatedAt($id: ID!) {
    user(userId: $id) {
      id
      created_at
    }
  }
`;
