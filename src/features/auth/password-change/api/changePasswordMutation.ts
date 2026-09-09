import { gql } from "@apollo/client";

export interface ChangePasswordData {
  changePassword: { id: string };
}

export interface ChangePasswordVariables {
  args: { oldPassword: string; newPassword: string; confirmPassword: string };
}
export const changePasswordMutation = gql`
  mutation ChangePassword($args: ChangePasswordInput!) {
    changePassword(args: $args) { id }
  }
`;
