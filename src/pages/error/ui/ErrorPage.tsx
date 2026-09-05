import {
  ConnectionErrorPage,
  type ConnectionErrorPageProps,
} from "@/shared/ui/connection-error-page";

export type ErrorPageProps = ConnectionErrorPageProps;

export function ErrorPage({ onRetry }: ErrorPageProps) {
  return <ConnectionErrorPage onRetry={onRetry} />;
}
