import type { Metadata } from "next";

import { SignUpPage } from "@/pages/auth/sign-up";

export const metadata: Metadata = {
  title: "Sign Up | CV Builder",
  description: "Create your CV Builder account.",
};

export default function SignUpRoute() {
  return <SignUpPage />;
}
