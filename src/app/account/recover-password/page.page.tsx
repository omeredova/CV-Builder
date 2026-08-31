import type { Metadata } from "next";

import { PasswordRecoveryPage } from "@/pages/auth/password-recovery";

export const metadata: Metadata = {
  title: "Forgot Password | CV Builder",
  description: "Request password recovery instructions for your CV Builder account.",
};

export default function PasswordRecoveryRoute() {
  return <PasswordRecoveryPage />;
}
