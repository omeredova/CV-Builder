import type { Metadata } from "next";

import { SignInPage } from "@/pages/auth";

export const metadata: Metadata = {
  title: "Sign In | CV Builder",
  description: "Sign in to continue building your CV.",
};

export default function SignInRoute() {
  return <SignInPage />;
}
