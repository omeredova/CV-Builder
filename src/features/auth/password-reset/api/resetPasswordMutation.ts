import { gql } from "@apollo/client";

export interface ResetPasswordMutationData {
  resetPassword: null;
}

export interface ResetPasswordMutationVariables {
  auth: {
    confirmPassword: string;
    newPassword: string;
  };
}

export const resetPasswordMutation = gql`
  mutation ResetPassword($auth: ResetPasswordInput!) {
    resetPassword(auth: $auth)
  }
`;
