"use client";

import { useState } from "react";

export interface RequestErrorState<TError> {
  clearError: () => void;
  error?: TError;
  setError: (error: TError) => void;
}

export interface AuthRequestState<TError> {
  clearError: () => void;
  error?: TError;
  isLoading: boolean;
}

export function useRequestError<TError>(): RequestErrorState<TError> {
  const [error, setError] = useState<TError>();

  return {
    clearError: () => setError(undefined),
    error,
    setError,
  };
}
