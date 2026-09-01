import type { ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";

export interface ErrorPageLayoutProps {
  actionLabel: string;
  children: ReactNode;
  icon: ReactNode;
  onAction: () => void;
  title: string;
}

export function ErrorPageLayout({
  actionLabel,
  children,
  icon,
  onAction,
  title,
}: ErrorPageLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-error-page-inline">
      <Empty className="min-h-0 w-full max-w-error-content-width flex-none gap-error-content-gap p-0 md:min-h-error-content-height md:p-0">
        <EmptyHeader className="w-full max-w-error-content-width gap-error-header-gap">
          <EmptyMedia className="mb-0">{icon}</EmptyMedia>
          <EmptyTitle className="text-error-title leading-error-title">{title}</EmptyTitle>
          <EmptyDescription className="w-full text-base leading-6 text-foreground">
            {children}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAction} type="button">
            {actionLabel}
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
