import type { Metadata } from "next";

import { LanguagesPage } from "@/pages/languages";

export const metadata: Metadata = { title: "Languages | CV Builder" };

export default function LanguagesRoute() {
  return <LanguagesPage />;
}
