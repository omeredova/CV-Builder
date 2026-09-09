"use client";

import { useCallback, useEffect, useRef } from "react";

import { beginApiRequest } from "./request-loading-store";

export function useApiLoaderNavigation(): () => void {
  const finishNavigationRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => finishNavigationRef.current?.();
  }, []);

  return useCallback(() => {
    finishNavigationRef.current ??= beginApiRequest();
  }, []);
}
