"use client";

import { useMutation } from "@apollo/client/react";

import { getErrorMessage } from "../../model/authError";
import { getAccessToken, isVerificationSessionExpired } from "../../model/authSession";
import {
  type AuthRequestState,
  useRequestError,
} from "../../model/useRequestError";
import {
  verifyMailMutation,
  type VerifyMailMutationData,
  type VerifyMailMutationVariables,
} from "../api/verifyMailMutation";
import type { VerificationError } from "./verificationError";

export interface UseEmailVerificationResult extends AuthRequestState<VerificationError> {
  verifyEmail: (code: string) => Promise<boolean>;
}

export function getVerificationError(error: unknown): VerificationError {
  const message = getErrorMessage(error);

  if (
    message.includes("actionExpired") ||
    message.includes("otpExpired") ||
    message.includes("jwt expired") ||
    message.includes("Unauthorized") ||
    message.includes("UNAUTHENTICATED")
  ) {
    return "expired";
  }

  return message.includes("mailNotFound") ? "invalid" : "server";
}

export function useEmailVerification(): UseEmailVerificationResult {
  const { clearError, error, setError } = useRequestError<VerificationError>();
  const [executeVerification, { loading }] = useMutation<
    VerifyMailMutationData,
    VerifyMailMutationVariables
  >(verifyMailMutation);

  async function verifyEmail(code: string): Promise<boolean> {
    clearError();

    if (isVerificationSessionExpired()) {
      setError("expired");
      return false;
    }

    const accessToken = getAccessToken();

    try {
      await executeVerification({
        context: {
          headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
        },
        variables: { mail: { otp: code } },
      });
      return true;
    } catch (requestError: unknown) {
      setError(getVerificationError(requestError));
      return false;
    }
  }

  return {
    clearError,
    error,
    isLoading: loading,
    verifyEmail,
  };
}
