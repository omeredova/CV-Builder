"use client";

import { useApolloClient } from "@apollo/client/react";
import { useRef, useState } from "react";
import { signUpAction } from "../../server/actions";
import { clearAuthSession, startVerificationSession } from "../../model/authSession";
import { type AuthRequestState, useRequestError } from "../../model/useRequestError";
import type { RegistrationError } from "./registrationError";
import type { SignUpValues } from "./validation";

export { getRegistrationError } from "./registrationError";

export interface UseSignUpResult extends AuthRequestState<RegistrationError> {
  signUp: (values: SignUpValues) => Promise<boolean>;
}

export function useSignUp(): UseSignUpResult {
  const client = useApolloClient();
  const { clearError, error, setError } = useRequestError<RegistrationError>();
  const [isLoading, setLoading] = useState(false);
  const pending = useRef(false);

  async function signUp(values: SignUpValues): Promise<boolean> {
    if (pending.current) return false;
    pending.current = true;
    setLoading(true);
    clearError();
    try {
      const result = await signUpAction(values);
      if (result.error) { setError(result.error); return false; }
      clearAuthSession();
      startVerificationSession();
      await client.clearStore();
      return true;
    } catch {
      setError("server");
      return false;
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  return { clearError, error, isLoading, signUp };
}
