"use client";

import { useQuery } from "@apollo/client/react";
import type { ReactNode } from "react";

import { profileSkillsQuery, SkillGroups, type ProfileSkillsQueryData, type ProfileSkillsQueryVariables } from "@/entities/skill";
import { CollectionContent } from "@/shared/ui/collection-content";
import { SkillsManagement, useProfileSkillOperations } from "@/features/skills-management";

import { UserSkillsSkeleton } from "./UserSkillsSkeleton";

export interface UserSkillsProps {
  userId: string;
  actions?: ReactNode;
  canEdit?: boolean;
}

export function UserSkills({ userId, actions, canEdit = false }: UserSkillsProps) {
  const operations = useProfileSkillOperations(userId, canEdit);
  const { data, loading, error, refetch } = useQuery<ProfileSkillsQueryData, ProfileSkillsQueryVariables>(profileSkillsQuery, {
    variables: { userId },
    context: { skipGlobalLoader: true },
  });

  return <CollectionContent
    loading={loading && !data?.profile}
    failed={Boolean(error) || !data?.profile}
    empty={!canEdit && !data?.profile?.skills.length}
    loadingLabel="Loading skills"
    loadingContent={<UserSkillsSkeleton />}
    errorMessage="Failed to load skills"
    retryLabel="Retry skills"
    emptyMessage="No skills added yet"
    onRetry={refetch}
    actions={actions}
  >
    {data?.profile && (canEdit ?
      <SkillsManagement key={userId} skills={data.profile.skills} categories={data.skillCategories} operations={operations} /> :
      <SkillGroups skills={data.profile.skills} categories={data.skillCategories} />)}
  </CollectionContent>;
}
