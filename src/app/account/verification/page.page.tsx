import type { Metadata } from "next";

import { EmailVerificationPage } from "@/pages/auth";

export const metadata: Metadata = {
  title: "Email Verification | CV Builder",
  description: "Verify your CV Builder account email address.",
};

export default function EmailVerificationRoute() {
  return <EmailVerificationPage />;
}
