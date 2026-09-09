import type { Metadata } from "next";

import { CvsPage } from "@/pages/cvs";

export const metadata: Metadata = { title: "CVs | CV Builder" };

export default function CvsRoute() {
  return <CvsPage />;
}
