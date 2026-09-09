"use client";

import { useMutation } from "@apollo/client/react";

import { getErrorMessage } from "../../model/authError";
import { saveAuthPayload, startVerificationSession } from "../../model/authSession";
import {
  type AuthRequestState,
  useRequestError,
} from "../../model/useRequestError";
import {
  signUpMutation,
  type SignUpMutationData,
  type SignUpMutationVariables,
} from "../api/signUpMutation";
import type { RegistrationError } from "./registrationError";
import type { SignUpValues } from "./validation";

export interface UseSignUpResult extends AuthRequestState<RegistrationError> {
  signUp: (values: SignUpValues) => Promise<boolean>;
}

export function getRegistrationError(error: unknown): RegistrationError {
  return getErrorMessage(error).includes("userAlreadyExists")
    ? "emailExists"
    : "server";
}

export function useSignUp(): UseSignUpResult {
  const { clearError, error, setError } = useRequestError<RegistrationError>();
  const [executeSignUp, { loading }] = useMutation<
    SignUpMutationData,
    SignUpMutationVariables
  >(signUpMutation);

  async function signUp(values: SignUpValues): Promise<boolean> {
    clearError();

    try {
      const result = await executeSignUp({ variables: { auth: values } });
      const auth = result.data?.signup;

      if (!auth) {
        throw new Error("missingSignUpData");
      }

      saveAuthPayload(auth);
      startVerificationSession();
      return true;
    } catch (requestError: unknown) {
      setError(getRegistrationError(requestError));
      return false;
    }
  }

  return {
    clearError,
    error,
    isLoading: loading,
    signUp,
  };
}
