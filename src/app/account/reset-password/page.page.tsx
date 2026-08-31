import type { Metadata } from "next";

import { PasswordResetPage } from "@/pages/auth";

export const metadata: Metadata = {
  title: "Reset Password | CV Builder",
  description: "Create a new password for your CV Builder account.",
};

export default function PasswordResetRoute() {
  return <PasswordResetPage />;
}
