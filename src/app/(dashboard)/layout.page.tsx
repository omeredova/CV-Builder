import type { ReactNode } from "react";

import { currentAccountQuery, type CurrentAccountQueryData } from "@/entities/employee";
import { PreferencesProvider } from "@/features/account-preferences";
import { AppShell } from "@/widgets/app-shell";
import { AppSidebar } from "@/widgets/app-sidebar";
import { ApolloDataBoundary } from "@/shared/api/graphql/ApolloDataBoundary";
import { PreloadQuery } from "../providers/apollo/serverClient";
import { requireDashboardSession } from "../server/requireSession";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireDashboardSession();
  return (
    <PreloadQuery<CurrentAccountQueryData, Record<string, never>> query={currentAccountQuery}>
      {(queryRef) => (
        <ApolloDataBoundary queryRef={queryRef}>
          <PreferencesProvider>
            <AppShell sidebar={<AppSidebar />}>{children}</AppShell>
          </PreferencesProvider>
        </ApolloDataBoundary>
      )}
    </PreloadQuery>
  );
}
