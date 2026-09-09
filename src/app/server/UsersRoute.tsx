import { Suspense } from "react";
import { createUsersQueryVariables, employeesQuery } from "@/entities/employee";
import { UsersPage } from "@/pages/users";
import { PreloadQuery } from "../providers/apollo/serverClient";
import { requireDashboardSession } from "./requireSession";

export async function UsersRoute() {
  await requireDashboardSession();
  return (
    <PreloadQuery query={employeesQuery} variables={createUsersQueryVariables({ limit: 10, page: 1, sortOrder: "asc" })}>
      <Suspense fallback={<p role="status" className="p-8">Loading employees…</p>}>
        <UsersPage />
      </Suspense>
    </PreloadQuery>
  );
}
