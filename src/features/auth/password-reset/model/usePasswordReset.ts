"use client";

import { useMutation } from "@apollo/client/react";

import { getErrorMessage } from "../../model/authError";
import type { PasswordConfirmationValues } from "../../model/validation";
import {
  type AuthRequestState,
  useRequestError,
} from "../../model/useRequestError";
import {
  resetPasswordMutation,
  type ResetPasswordMutationData,
  type ResetPasswordMutationVariables,
} from "../api/resetPasswordMutation";
import type { PasswordResetError } from "./passwordResetError";

export interface UsePasswordResetResult extends AuthRequestState<PasswordResetError> {
  resetPassword: (values: PasswordConfirmationValues, token: string) => Promise<boolean>;
}

export function getPasswordResetError(error: unknown): PasswordResetError {
  const message = getErrorMessage(error);

  if (
    message.includes("actionExpired") ||
    message.includes("jwt expired") ||
    message.includes("invalid token") ||
    message.includes("UNAUTHENTICATED")
  ) {
    return "expiredLink";
  }

  return "server";
}

export function usePasswordReset(): UsePasswordResetResult {
  const { clearError, error, setError } = useRequestError<PasswordResetError>();
  const [executeReset, { loading }] = useMutation<
    ResetPasswordMutationData,
    ResetPasswordMutationVariables
  >(resetPasswordMutation);

  async function resetPassword(
    values: PasswordConfirmationValues,
    token: string,
  ): Promise<boolean> {
    clearError();

    if (!token) {
      setError("expiredLink");
      return false;
    }

    try {
      await executeReset({
        context: {
          headers: { authorization: `Bearer ${token}` },
        },
        variables: {
          auth: {
            confirmPassword: values.confirmPassword,
            newPassword: values.password,
          },
        },
      });
      return true;
    } catch (requestError: unknown) {
      setError(getPasswordResetError(requestError));
      return false;
    }
  }

  return {
    clearError,
    error,
    isLoading: loading,
    resetPassword,
  };
}
