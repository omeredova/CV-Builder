"use client";

import { useQuery } from "@apollo/client/react";
import type { ReactNode } from "react";

import { profileSkillsQuery, SkillGroups, type ProfileSkillsQueryData, type ProfileSkillsQueryVariables } from "@/entities/skill";
import { Button } from "@/shared/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/shared/ui/empty";
import { Skeleton } from "@/shared/ui/skeleton";

export interface UserSkillsProps {
  userId: string;
  actions?: ReactNode;
}

export function UserSkills({ userId, actions }: UserSkillsProps) {
  const { data, loading, error, refetch } = useQuery<ProfileSkillsQueryData, ProfileSkillsQueryVariables>(profileSkillsQuery, {
    variables: { userId },
    context: { skipGlobalLoader: true },
  });

  if (loading) return <div role="status" aria-label="Loading skills" className="space-y-8">
    {[0, 1, 2].map((group) => <div key={group} aria-hidden="true">
      <Skeleton className="h-6 w-44" />
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => <div className="flex h-10 items-center gap-4 px-4" key={item}>
          <Skeleton className="h-1 w-20 shrink-0" /><Skeleton className="h-5 w-24" />
        </div>)}
      </div>
    </div>)}
  </div>;

  if (error || !data?.profile) return <div className="grid min-h-64 content-center justify-items-center gap-4">
    <p role="alert">Failed to load skills</p>
    <Button variant="secondary" onClick={() => { void refetch().catch(() => undefined); }}>Retry skills</Button>
  </div>;

  return <>
    {data.profile.skills.length ? (
      <SkillGroups skills={data.profile.skills} categories={data.skillCategories} />
    ) : (
      <Empty className="min-h-20">
        <EmptyHeader><EmptyTitle className="text-base font-normal">No skills here</EmptyTitle></EmptyHeader>
      </Empty>
    )}
    {actions}
  </>;
}
