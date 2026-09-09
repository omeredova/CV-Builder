import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCvTab } from "@/pages/cvs";
import { CvDetailsRoute } from "@/app/server/CvDetailsRoute";

export const metadata: Metadata = { title: "CV Details" };
export default async function Page({ params }: { params: Promise<{ cvId: string; tab: string }> }) {
  await requireDashboardSession();
  const { cvId, tab } = await params;
  if (!isCvTab(tab)) notFound();
  return <CvDetailsRoute key={`${cvId}/${tab}`} cvId={cvId} initialTab={tab} />;
}
