import type { ReactNode } from "react";

import { AppShell } from "@/widgets/app-shell";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
