import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";

interface AppShellProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
