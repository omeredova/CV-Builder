import type { ReactElement } from "react";
import { cvQuery, cvSkillsQuery, cvProjectsQuery } from "@/entities/cv";
import { skillCategoriesQuery } from "@/entities/skill";
import { cvPreviewQuery } from "@/features/cv-preview/server";
import { CvDetailsPage, type CvTab } from "@/pages/cvs";
import { ApolloDataBoundary } from "@/shared/api/graphql/ApolloDataBoundary";
import { PreloadQuery } from "../providers/apollo/serverClient";
import { requireCvOwner } from "./requireCvOwner";

interface CvDetailsRouteProps { cvId: string; initialTab?: CvTab }

export async function CvDetailsRoute({ cvId, initialTab = "details" }: CvDetailsRouteProps): Promise<ReactElement> {
  // Complete authorization before creating query references transported to the browser.
  await requireCvOwner(cvId);
  const query = initialTab === "skills" ? cvSkillsQuery : initialTab === "projects" ? cvProjectsQuery : initialTab === "preview" ? cvPreviewQuery : cvQuery;
  const page = <CvDetailsPage cvId={cvId} initialTab={initialTab} />;
  return <PreloadQuery query={query} variables={{ cvId }}>
    {(queryRef) => <ApolloDataBoundary queryRef={queryRef}>
      {initialTab === "skills" || initialTab === "preview"
        ? <PreloadQuery query={skillCategoriesQuery}>
            {(categoriesRef) => <ApolloDataBoundary queryRef={categoriesRef}>{page}</ApolloDataBoundary>}
          </PreloadQuery>
        : page}
    </ApolloDataBoundary>}
  </PreloadQuery>;
}
