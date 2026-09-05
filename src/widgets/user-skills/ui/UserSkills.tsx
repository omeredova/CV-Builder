"use client";

import { useQuery } from "@apollo/client/react";
import type { ReactNode } from "react";

import { profileSkillsQuery, SkillGroups, type ProfileSkillsQueryData, type ProfileSkillsQueryVariables } from "@/entities/skill";
import { CollectionContent } from "@/shared/ui/collection-content";

import { UserSkillsSkeleton } from "./UserSkillsSkeleton";

export interface UserSkillsProps {
  userId: string;
  actions?: ReactNode;
}

export function UserSkills({ userId, actions }: UserSkillsProps) {
  const { data, loading, error, refetch } = useQuery<ProfileSkillsQueryData, ProfileSkillsQueryVariables>(profileSkillsQuery, {
    variables: { userId },
    context: { skipGlobalLoader: true },
  });

  return <CollectionContent
    loading={loading}
    failed={Boolean(error) || !data?.profile}
    empty={!data?.profile?.skills.length}
    loadingLabel="Loading skills"
    loadingContent={<UserSkillsSkeleton />}
    errorMessage="Failed to load skills"
    retryLabel="Retry skills"
    emptyMessage="No skills here"
    onRetry={refetch}
    actions={actions}
  >
    {data?.profile && <SkillGroups skills={data.profile.skills} categories={data.skillCategories} />}
  </CollectionContent>;
}
