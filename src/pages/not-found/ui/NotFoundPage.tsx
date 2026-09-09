"use client";

import { useRouter } from "next/navigation";

import { ErrorPageLayout } from "@/shared/ui/error-page-layout";
import { ConnectionErrorIcon } from "@/shared/ui/icons/ConnectingErrorIcon";

export function NotFoundPage() {
  const router = useRouter();

  return (
    <ErrorPageLayout
      actionLabel="Go back"
      icon={<ConnectionErrorIcon />}
      onAction={() => router.back()}
      title="Hmm..."
    >
      This doesn&apos;t seem to be the page you were looking for.
      <br /> Let&apos;s get you back on track.
    </ErrorPageLayout>
  );
}
