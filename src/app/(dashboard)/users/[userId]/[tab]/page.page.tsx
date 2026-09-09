import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserDetailsPage, isUserProfileTab } from "@/pages/users";

export const metadata: Metadata = { title: "Employee Details" };

export default async function Page({ params }: { params: Promise<{ userId: string; tab: string }> }) {
  const { userId, tab } = await params;
  if (!isUserProfileTab(tab)) notFound();
  return <UserDetailsPage key={`${userId}/${tab}`} userId={userId} initialTab={tab} />;
}
