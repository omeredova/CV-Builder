import type { ReactNode } from "react";

import { AuthTabs, type AuthTab } from "@/features/auth";
import { cn } from "@/shared/lib/class-names";

export interface AuthPageLayoutProps {
  activeTab?: AuthTab;
  children: ReactNode;
  contentClassName?: string;
}

export function AuthPageLayout({ activeTab, children, contentClassName }: AuthPageLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-auth-page-inline pb-auth-page-bottom pt-auth-page-top-tablet text-foreground">
      {activeTab ? <AuthTabs activeTab={activeTab} /> : null}

      <section
        className={cn(
          "flex w-full max-w-auth-content-width flex-1 items-center justify-center",
          contentClassName,
        )}
      >
        {children}
      </section>
    </main>
  );
}
