import { gql } from "@apollo/client";

export interface SignInMutationData {
  login: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
    };
  };
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
