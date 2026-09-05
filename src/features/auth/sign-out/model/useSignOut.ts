"use client";

import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { clearAuthSession } from "../../model/authSession";

export interface UseSignOutResult {
  signOut: () => Promise<void>;
}

export function useSignOut(): UseSignOutResult {
  const apolloClient = useApolloClient();
  const router = useRouter();

  const signOut = useCallback(async (): Promise<void> => {
    clearAuthSession();

    try {
      await apolloClient.clearStore();
    } finally {
      router.replace("/login");
    }
  }, [apolloClient, router]);

  return { signOut };
}
