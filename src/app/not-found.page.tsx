import type { Metadata } from "next";

import { NotFoundPage } from "@/pages/not-found";

export const metadata: Metadata = {
  title: "Page not found | CV Builder",
};

export default function NotFound() {
  return <NotFoundPage />;
}
