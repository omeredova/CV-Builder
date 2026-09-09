import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";
import { CvDetailsRoute } from "@/app/server/CvDetailsRoute";

export const metadata: Metadata = { title: "CV Details" };
export default async function Page({ params }: { params: Promise<{ cvId: string }> }) {
  await requireDashboardSession();
  const { cvId } = await params;
  return <CvDetailsRoute cvId={cvId} />;
}
