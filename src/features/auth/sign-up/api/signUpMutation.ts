import { gql } from "@apollo/client";

import type { AuthPayload } from "../../model/authSession";

export interface SignUpMutationData {
  signup: AuthPayload;
}

export interface SignUpMutationVariables {
  auth: {
    confirmPassword: string;
    email: string;
    password: string;
  };
}

export const signUpMutation = gql`
  mutation SignUp($auth: SignupInput!) {
    signup(auth: $auth) {
      access_token
      refresh_token
      user {
        id
      }
    }
  }
`;
