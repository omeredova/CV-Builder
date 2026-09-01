import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import { ConnectionErrorIcon } from "@/shared/ui/icons/ConnectingErrorIcon";

export interface ErrorPageProps {
  onRetry: () => void;
}
export function ErrorPage({ onRetry }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-error-page-inline">
      <Empty className="min-h-0 w-full max-w-error-content-width flex-none gap-error-content-gap p-0 md:min-h-error-content-height md:p-0">
        <EmptyHeader className="w-full max-w-error-content-width gap-error-header-gap">
          <EmptyMedia className="mb-0">
            <ConnectionErrorIcon />
          </EmptyMedia>
          <EmptyTitle className="text-error-title leading-error-title">Oops!</EmptyTitle>
          <EmptyDescription className="w-full text-base leading-6 text-foreground">
            Something went wrong. We&apos;re already working on fixing it.
            <br/> Please try again or go back.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry} type="button">
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
