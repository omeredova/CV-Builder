import { gql } from "@apollo/client";

export interface UserCreatedAtQueryData {
  user: {
    created_at: string;
  } | null;
}

export interface UserCreatedAtQueryVariables {
  id: string;
}

export const userCreatedAtQuery = gql`
  query UserCreatedAt($id: ID!) {
    user(userId: $id) {
      created_at
    }
  }
`;
