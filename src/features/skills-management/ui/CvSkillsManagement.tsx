"use client";

import { useQuery } from "@apollo/client/react";
import { skillCategoriesQuery, SkillGroups, SkillGroupsSkeleton, type AssignedSkill, type SkillCategoriesQueryData } from "@/entities/skill";
import { CollectionContent } from "@/shared/ui/collection-content";
import { useCvSkillOperations } from "../model/useCvSkillOperations";
import { SkillsManagement } from "./SkillsManagement";

export interface CvSkillsManagementProps { cvId: string; ownerId: string; skills: readonly AssignedSkill[]; canEdit: boolean }
export function CvSkillsManagement({ cvId, ownerId, skills, canEdit }: CvSkillsManagementProps) {
  const operations = useCvSkillOperations(cvId, ownerId, canEdit);
  const { data, loading, error, refetch } = useQuery<SkillCategoriesQueryData>(skillCategoriesQuery, { context: { skipGlobalLoader: true } });
  return <CollectionContent loading={loading && !data} failed={!!error || !data} empty={!canEdit && !skills.length}
    loadingLabel="Loading skills" loadingContent={<SkillGroupsSkeleton />}
    errorMessage="Failed to load skills" retryLabel="Retry skills" emptyMessage="No skills added yet" onRetry={refetch}>
    {data && (canEdit ? <SkillsManagement disableUntilValid removalActionLabel="REMOVE" skills={skills} categories={data.skillCategories} operations={operations} /> : <SkillGroups skills={skills} categories={data.skillCategories} />)}
  </CollectionContent>;
}
