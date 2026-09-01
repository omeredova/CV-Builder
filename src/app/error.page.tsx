"use client";

import { ErrorPage } from "@/pages/error";

export default function Error({ retry }: { retry: () => void }) {
  return <ErrorPage onRetry={retry} />;
}
