import { gql } from "@apollo/client";

import type { AuthPayload } from "../../model/authSession";

export interface SignInMutationData {
  login: AuthPayload;
}

export interface SignInMutationVariables {
  auth: {
    email: string;
    password: string;
  };
}

export const signInMutation = gql`
  mutation SignIn($auth: AuthInput!) {
    login(auth: $auth) {
      access_token
      refresh_token
      user {
        id
      }
    }
  }
`;
