import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { currentAccountQuery, type CurrentAccountQueryData } from "@/entities/employee";
import { isUnauthorizedError, readSession } from "@/features/auth/server";
import { createBackendClient } from "@/shared/api/create-backend-client";

export async function requireSession(returnTo: "/" | "/users"): Promise<CurrentAccountQueryData["me"]> {
  const { accessToken, refreshToken } = await readSession();
  const renew = () => redirect(refreshToken ? `/auth/refresh?returnTo=${encodeURIComponent(returnTo)}` : "/login");
  if (!accessToken) renew();
  const client = createBackendClient({ authorization: `Bearer ${accessToken}` });
  try {
    const { data } = await client.query<CurrentAccountQueryData>({ query: currentAccountQuery });
    if (!data?.me) return renew();
    return data.me;
  } catch (error) {
    if (isUnauthorizedError(error)) renew();
    throw error;
  } finally {
    client.stop();
  }
}

export const requireDashboardSession = cache(async (): Promise<CurrentAccountQueryData["me"]> => {
  return requireSession("/");
});
