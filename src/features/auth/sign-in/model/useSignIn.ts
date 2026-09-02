"use client";

import { useMutation } from "@apollo/client/react";

import { getErrorMessage } from "../../model/authError";
import { saveAuthPayload } from "../../model/authSession";
import {
  type AuthRequestState,
  useRequestError,
} from "../../model/useRequestError";
import {
  signInMutation,
  type SignInMutationData,
  type SignInMutationVariables,
} from "../api/signInMutation";
import type { AuthenticationError } from "./authenticationError";
import type { SignInValues } from "./validation";

export interface UseSignInResult extends AuthRequestState<AuthenticationError> {
  signIn: (values: SignInValues) => Promise<boolean>;
}

export function getAuthenticationError(error: unknown): AuthenticationError {
  return getErrorMessage(error).includes("invalidCredentials")
    ? "invalidCredentials"
    : "server";
}

export function useSignIn(): UseSignInResult {
  const { clearError, error, setError } = useRequestError<AuthenticationError>();
  const [executeSignIn, { loading }] = useMutation<
    SignInMutationData,
    SignInMutationVariables
  >(signInMutation);

  async function signIn(values: SignInValues): Promise<boolean> {
    clearError();

    try {
      const result = await executeSignIn({ variables: { auth: values } });
      const auth = result.data?.login;

      if (!auth) {
        throw new Error("missingSignInData");
      }

      saveAuthPayload(auth);
      return true;
    } catch (requestError: unknown) {
      setError(getAuthenticationError(requestError));
      return false;
    }
  }

  return {
    clearError,
    error,
    isLoading: loading,
    signIn,
  };
}
