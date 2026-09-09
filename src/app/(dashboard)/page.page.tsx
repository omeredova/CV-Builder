import type { Metadata } from "next";

import { UsersRoute } from "../server/UsersRoute";

export const metadata: Metadata = { title: "Employees | CV Builder" };

export default function HomeRoute() {
  return <UsersRoute />;
}
