import type { Metadata } from "next";

import { SkillsPage } from "@/pages/skills";

export const metadata: Metadata = { title: "Skills | CV Builder" };

export default function SkillsRoute() {
  return <SkillsPage />;
}
