import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isUserProfileTab } from "@/pages/users";
import { UserDetailsRoute } from "@/app/server/UserDetailsRoute";

export const metadata: Metadata = { title: "Employee Details" };

export default async function Page({ params }: { params: Promise<{ userId: string; tab: string }> }) {
  await requireDashboardSession();
  const { userId, tab } = await params;
  if (!isUserProfileTab(tab)) notFound();
  return <UserDetailsRoute key={`${userId}/${tab}`} userId={userId} initialTab={tab} />;
}
