import { gql } from "@apollo/client";

export interface VerifyMailMutationData {
  verifyMail: null;
}

export interface VerifyMailMutationVariables {
  mail: {
    otp: string;
  };
}

export const verifyMailMutation = gql`
  mutation VerifyMail($mail: VerifyMailInput!) {
    verifyMail(mail: $mail)
  }
`;
