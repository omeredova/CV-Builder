import { gql } from "@apollo/client";

export interface CurrentAccountQueryData {
  me: {
    id: string;
    avatar: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export const currentAccountQuery = gql`
  query CurrentAccount {
    me {
      id
      avatar
      email
      first_name
      last_name
    }
  }
`;
