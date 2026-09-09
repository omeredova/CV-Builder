import { requireDashboardSession } from "@/app/server/requireSession";
import type { Metadata } from "next";
import { profileSkillsQuery } from "@/entities/skill";
import { PreloadQuery } from "@/app/providers/apollo/serverClient";
import { ApolloDataBoundary } from "@/shared/api/graphql/ApolloDataBoundary";

import { SkillsPage } from "@/pages/skills";

export const metadata: Metadata = { title: "Skills | CV Builder" };

export default async function SkillsRoute() {
  const account = await requireDashboardSession();
  return <PreloadQuery query={profileSkillsQuery} variables={{ userId: account.id }}>
    {(queryRef) => <ApolloDataBoundary queryRef={queryRef}><SkillsPage /></ApolloDataBoundary>}
  </PreloadQuery>;
}
