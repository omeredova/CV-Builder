"use client";

import { useApolloClient } from "@apollo/client/react";
import { useRef, useState } from "react";
import { signInAction } from "../../server/actions";
import { clearAuthSession } from "../../model/authSession";
import { type AuthRequestState, useRequestError } from "../../model/useRequestError";
import type { AuthenticationError } from "./authenticationError";
import type { SignInValues } from "./validation";

export { getAuthenticationError } from "./authenticationError";

export interface UseSignInResult extends AuthRequestState<AuthenticationError> {
  signIn: (values: SignInValues) => Promise<boolean>;
}

export function useSignIn(): UseSignInResult {
  const client = useApolloClient();
  const { clearError, error, setError } = useRequestError<AuthenticationError>();
  const [isLoading, setLoading] = useState(false);
  const pending = useRef(false);

  async function signIn(values: SignInValues): Promise<boolean> {
    if (pending.current) return false;
    pending.current = true;
    setLoading(true);
    clearError();
    try {
      const result = await signInAction(values);
      if (result.error) { setError(result.error); return false; }
      clearAuthSession();
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

  return { clearError, error, isLoading, signIn };
}
