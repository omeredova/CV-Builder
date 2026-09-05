import type { Metadata } from "next";

import { UsersPage } from "@/pages/users";

export const metadata: Metadata = { title: "Employees | CV Builder" };

export default function HomeRoute() {
  return <UsersPage />;
}
