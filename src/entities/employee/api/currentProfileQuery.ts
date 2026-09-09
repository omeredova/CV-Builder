import { gql } from "@apollo/client";

export interface CurrentProfileQueryData {
  me: { id: string };
}

export const currentProfileQuery = gql`
  query CurrentProfile {
    me {
      id
    }
  }
`;
