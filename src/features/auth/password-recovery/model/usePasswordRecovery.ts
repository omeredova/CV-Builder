"use client";

import { useMutation } from "@apollo/client/react";

import { getErrorMessage } from "../../model/authError";
import {
  type AuthRequestState,
  useRequestError,
} from "../../model/useRequestError";
import {
  forgotPasswordMutation,
  type ForgotPasswordMutationData,
  type ForgotPasswordMutationVariables,
} from "../api/forgotPasswordMutation";
import type { PasswordRecoveryError } from "./passwordRecoveryError";
import type { PasswordRecoveryValues } from "./validation";

export interface UsePasswordRecoveryResult extends AuthRequestState<PasswordRecoveryError> {
  requestPasswordReset: (values: PasswordRecoveryValues) => Promise<boolean>;
}

export function getPasswordRecoveryError(error: unknown): PasswordRecoveryError {
  const message = getErrorMessage(error);

  return message.includes("mailNotFound") || message.includes("userNotFound")
    ? "accountNotFound"
    : "server";
}

export function usePasswordRecovery(): UsePasswordRecoveryResult {
  const { clearError, error, setError } = useRequestError<PasswordRecoveryError>();
  const [executeRecovery, { loading }] = useMutation<
    ForgotPasswordMutationData,
    ForgotPasswordMutationVariables
  >(forgotPasswordMutation);

  async function requestPasswordReset(values: PasswordRecoveryValues): Promise<boolean> {
    clearError();

    try {
      await executeRecovery({ variables: { auth: values } });
      return true;
    } catch (requestError: unknown) {
      setError(getPasswordRecoveryError(requestError));
      return false;
    }
  }

  return {
    clearError,
    error,
    isLoading: loading,
    requestPasswordReset,
  };
}
