import type { ReactNode } from "react";

import { AppSidebar } from "@/widgets/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
