import { ErrorPageLayout } from "@/shared/ui/error-page-layout";
import { ConnectionErrorIcon } from "@/shared/ui/icons/ConnectingErrorIcon";

export interface ErrorPageProps {
  onRetry: () => void;
}
export function ErrorPage({ onRetry }: ErrorPageProps) {
  return (
    <ErrorPageLayout
      actionLabel="Retry"
      icon={<ConnectionErrorIcon />}
      onAction={onRetry}
      title="Oops!"
    >
      Something went wrong. We&apos;re already working on fixing it.
      <br /> Please try again or go back.
    </ErrorPageLayout>
  );
}
