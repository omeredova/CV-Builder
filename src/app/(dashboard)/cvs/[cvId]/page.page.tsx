import type { Metadata } from "next";
import { CvDetailsPage } from "@/pages/cvs";

export const metadata: Metadata = { title: "CV Details" };
export default async function Page({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;
  return <CvDetailsPage cvId={cvId} />;
}
