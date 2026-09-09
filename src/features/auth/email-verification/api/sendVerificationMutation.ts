import { gql } from "@apollo/client";

export interface SendVerificationMutationData {
  sendVerification: null;
}

export interface SendVerificationMutationVariables {
  email: string;
}

export const sendVerificationMutation = gql`
  mutation SendVerification($email: String!) {
    sendVerification(email: $email)
  }
`;
