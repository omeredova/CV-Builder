import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";
import { profileLanguagesQuery } from "@/entities/language";
import { PreloadQuery } from "@/app/providers/apollo/serverClient";
import { ApolloDataBoundary } from "@/shared/api/graphql/ApolloDataBoundary";

import { LanguagesPage } from "@/pages/languages";

export const metadata: Metadata = { title: "Languages | CV Builder" };

export default async function LanguagesRoute() {
  const account = await requireDashboardSession();
  return <PreloadQuery query={profileLanguagesQuery} variables={{ userId: account.id }}>
    {(queryRef) => <ApolloDataBoundary queryRef={queryRef}><LanguagesPage /></ApolloDataBoundary>}
  </PreloadQuery>;
}
