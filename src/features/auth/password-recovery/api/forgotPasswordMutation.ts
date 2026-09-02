import { gql } from "@apollo/client";

export interface ForgotPasswordMutationData {
  forgotPassword: null;
}

export interface ForgotPasswordMutationVariables {
  auth: {
    email: string;
  };
}

export const forgotPasswordMutation = gql`
  mutation ForgotPassword($auth: ForgotPasswordInput!) {
    forgotPassword(auth: $auth)
  }
`;
