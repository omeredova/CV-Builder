import type { ReactNode } from "react";

import { PreferencesProvider } from "@/features/account-preferences";
import { AppShell } from "@/widgets/app-shell";
import { AppSidebar } from "@/widgets/app-sidebar";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <PreferencesProvider>
      <AppShell sidebar={<AppSidebar />}>{children}</AppShell>
    </PreferencesProvider>
  );
}
