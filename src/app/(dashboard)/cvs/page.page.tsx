import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";

import { cvsQuery } from "@/entities/cv";
import { PreloadQuery } from "@/app/providers/apollo/serverClient";
import { ApolloDataBoundary } from "@/shared/api/graphql/ApolloDataBoundary";
import { CvsPage } from "@/pages/cvs";

export const metadata: Metadata = { title: "CVs | CV Builder" };

export default async function CvsRoute() {
  const account = await requireDashboardSession();
  return <PreloadQuery query={cvsQuery} variables={{ userId: account.id, params: { page: 1, limit: 10, search: "", sort_by: "name", sort_order: "asc" } }}>
    {(queryRef) => <ApolloDataBoundary queryRef={queryRef}><CvsPage /></ApolloDataBoundary>}
  </PreloadQuery>;
}
