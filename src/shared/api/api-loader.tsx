"use client";

import { useSyncExternalStore } from "react";

import { Spinner } from "@/shared/ui/spinner";

import { getIsApiRequestActive, subscribeToApiRequestLoading } from "./request-loading-store";

function getServerSnapshot(): false {
  return false;
}

export function ApiLoader() {
  const isLoading = useSyncExternalStore(
    subscribeToApiRequestLoading,
    getIsApiRequestActive,
    getServerSnapshot,
  );

  if (!isLoading) return null;

  return (
    <div
      aria-label="API request in progress"
      aria-live="polite"
      className="fixed inset-0 z-(--z-index-api-loader) grid place-items-center bg-loader-overlay"
    >
      <Spinner className="size-loader-indicator text-primary" />
    </div>
  );
}
