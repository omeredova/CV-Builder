import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";
import { UserDetailsRoute } from "@/app/server/UserDetailsRoute";

export const metadata: Metadata = { title: "Employee Details" };

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  await requireDashboardSession();
  const { userId } = await params;
  return <UserDetailsRoute userId={userId} />;
}
