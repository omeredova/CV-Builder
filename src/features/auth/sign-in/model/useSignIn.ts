"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { saveAuthSession } from "../../model/authSession";
import {
  signInMutation,
  type SignInMutationData,
  type SignInMutationVariables,
} from "../api/signInMutation";
import type { AuthenticationError } from "./authenticationError";
import type { SignInValues } from "./validation";

export interface UseSignInResult {
  clearError: () => void;
  error?: AuthenticationError;
  isLoading: boolean;
  signIn: (values: SignInValues) => Promise<boolean>;
}

export function getAuthenticationError(error: unknown): AuthenticationError {
  return error instanceof Error && error.message.includes("invalidCredentials")
    ? "invalidCredentials"
    : "server";
}

export function useSignIn(): UseSignInResult {
  const [error, setError] = useState<AuthenticationError>();
  const [executeSignIn, { loading }] = useMutation<
    SignInMutationData,
    SignInMutationVariables
  >(signInMutation);

  async function signIn(values: SignInValues): Promise<boolean> {
    setError(undefined);

    try {
      const result = await executeSignIn({ variables: { auth: values } });
      const auth = result.data?.login;

      if (!auth) {
        throw new Error("missingSignInData");
      }

      saveAuthSession({
        accessToken: auth.access_token,
        refreshToken: auth.refresh_token,
      });
      return true;
    } catch (requestError: unknown) {
      setError(getAuthenticationError(requestError));
      return false;
    }
  }

  return {
    clearError: () => setError(undefined),
    error,
    isLoading: loading,
    signIn,
  };
}
