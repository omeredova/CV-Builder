"use client";

import { useApolloClient } from "@apollo/client/react";
import { useCallback } from "react";

import { signOutAction } from "../../server/actions";

import { clearAuthSession } from "../../model/authSession";

export interface UseSignOutResult {
  signOut: () => Promise<void>;
}

export function useSignOut(): UseSignOutResult {
  const apolloClient = useApolloClient();

  const signOut = useCallback(async (): Promise<void> => {
    await signOutAction();
    clearAuthSession();

    try {
      await apolloClient.clearStore();
    } finally {
      window.location.replace("/login");
    }
  }, [apolloClient]);

  return { signOut };
}
