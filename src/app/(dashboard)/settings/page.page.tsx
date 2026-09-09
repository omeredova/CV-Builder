import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";

import { SettingsPage } from "@/pages/settings";

export const metadata: Metadata = { title: "Settings | CV Builder" };

export default async function SettingsRoute() {
  await requireDashboardSession();
  return <SettingsPage />;
}
