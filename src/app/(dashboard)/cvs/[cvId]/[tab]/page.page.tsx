import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CvDetailsPage, isCvTab } from "@/pages/cvs";

export const metadata: Metadata = { title: "CV Details" };
export default async function Page({ params }: { params: Promise<{ cvId: string; tab: string }> }) {
  const { cvId, tab } = await params;
  if (!isCvTab(tab)) notFound();
  return <CvDetailsPage key={`${cvId}/${tab}`} cvId={cvId} initialTab={tab} />;
}
