"use client";

import { ErrorPage } from "@/pages/error";

export default function ErrorPreview() {
  return <ErrorPage onRetry={() => window.location.reload()} />;
}
