"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { saveAuthSession, startVerificationSession } from "../../model/authSession";
import {
  signUpMutation,
  type SignUpMutationData,
  type SignUpMutationVariables,
} from "../api/signUpMutation";
import type { RegistrationError } from "./registrationError";
import type { SignUpValues } from "./validation";

export interface UseSignUpResult {
  clearError: () => void;
  error?: RegistrationError;
  isLoading: boolean;
  signUp: (values: SignUpValues) => Promise<boolean>;
}

export function getRegistrationError(error: unknown): RegistrationError {
  return error instanceof Error && error.message.includes("userAlreadyExists")
    ? "emailExists"
    : "server";
}

export function useSignUp(): UseSignUpResult {
  const [error, setError] = useState<RegistrationError>();
  const [executeSignUp, { loading }] = useMutation<
    SignUpMutationData,
    SignUpMutationVariables
  >(signUpMutation);

  async function signUp(values: SignUpValues): Promise<boolean> {
    setError(undefined);

    try {
      const result = await executeSignUp({ variables: { auth: values } });
      const auth = result.data?.signup;

      if (!auth) {
        throw new Error("missingSignUpData");
      }

      saveAuthSession({
        accessToken: auth.access_token,
        refreshToken: auth.refresh_token,
      });
      startVerificationSession();
      return true;
    } catch (requestError: unknown) {
      setError(getRegistrationError(requestError));
      return false;
    }
  }

  return {
    clearError: () => setError(undefined),
    error,
    isLoading: loading,
    signUp,
  };
}
