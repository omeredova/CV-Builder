"use client";

import { useSearchParams } from "next/navigation";

export function VerificationSentNotice() {
  const searchParams = useSearchParams();

  if (searchParams?.get("sent") !== "true") return null;

  return (
    <p className="mb-4 text-center text-sm text-foreground" role="status">
      Verification email has been sent
    </p>
  );
}
