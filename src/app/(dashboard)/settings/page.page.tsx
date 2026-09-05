import type { Metadata } from "next";

import { SettingsPage } from "@/pages/settings";

export const metadata: Metadata = { title: "Settings | CV Builder" };

export default function SettingsRoute() {
  return <SettingsPage />;
}
