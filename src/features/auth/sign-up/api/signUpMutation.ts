import { gql } from "@apollo/client";

export interface SignUpMutationData {
  signup: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
    };
  };
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
