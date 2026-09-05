import type { Metadata } from "next";

import { PasswordResetPage } from "@/pages/auth";

export const metadata: Metadata = {
  title: "Reset Password | CV Builder",
  description: "Create a new password for your CV Builder account.",
};

interface PasswordResetRouteProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function PasswordResetRoute({ searchParams }: PasswordResetRouteProps) {
  const tokenParameter = (await searchParams).token;
  const token = typeof tokenParameter === "string" ? tokenParameter : "";

  return <PasswordResetPage token={token} />;
}
