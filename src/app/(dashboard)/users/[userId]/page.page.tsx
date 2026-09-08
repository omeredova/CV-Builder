import type { Metadata } from "next";
import { UserDetailsPage } from "@/pages/users";

export const metadata: Metadata = { title: "Employee Details" };

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <UserDetailsPage userId={userId} />;
}
