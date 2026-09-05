"use client";

import { useQuery } from "@apollo/client/react";
import { currentAccountQuery, type CurrentAccountQueryData } from "../api/currentAccountQuery";

interface CurrentAccountState {
  account?: CurrentAccountQueryData["me"];
  loading: boolean;
  error?: string;
}

export function useCurrentAccount(): CurrentAccountState {
  const { data, loading, error } = useQuery<CurrentAccountQueryData>(currentAccountQuery);
  return {
    account: data?.me,
    loading,
    error: error ? "Unable to load your account. Please reload the page to try again." : undefined,
  };
}
