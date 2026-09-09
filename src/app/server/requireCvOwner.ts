import "server-only";

import { notFound } from "next/navigation";
import { cvHeaderQuery, type Cv, type CvQueryData } from "@/entities/cv";
import { readSession } from "@/features/auth/server";
import { createBackendClient } from "@/shared/api/create-backend-client";
import { requireDashboardSession } from "./requireSession";

export async function requireCvOwner(cvId: string): Promise<void> {
  const account = await requireDashboardSession();
  const { accessToken } = await readSession();
  const client = createBackendClient({ authorization: `Bearer ${accessToken}` });
  try {
    const { data } = await client.query<CvQueryData<Pick<Cv, "id" | "name" | "user">>>({
      query: cvHeaderQuery, variables: { cvId },
    });
    if (!data?.cv || data.cv.user?.id !== account.id) notFound();
  } finally {
    client.stop();
  }
}
