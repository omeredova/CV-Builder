"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { getAccessToken, isVerificationSessionExpired } from "../../model/authSession";
import {
  verifyMailMutation,
  type VerifyMailMutationData,
  type VerifyMailMutationVariables,
} from "../api/verifyMailMutation";
import type { VerificationError } from "./verificationError";

export interface UseEmailVerificationResult {
  clearError: () => void;
  error?: VerificationError;
  isLoading: boolean;
  verifyEmail: (code: string) => Promise<boolean>;
}

export function getVerificationError(error: unknown): VerificationError {
  const message = error instanceof Error ? error.message : "";

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
  const [error, setError] = useState<VerificationError>();
  const [executeVerification, { loading }] = useMutation<
    VerifyMailMutationData,
    VerifyMailMutationVariables
  >(verifyMailMutation);

  async function verifyEmail(code: string): Promise<boolean> {
    setError(undefined);

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
    clearError: () => setError(undefined),
    error,
    isLoading: loading,
    verifyEmail,
  };
}
