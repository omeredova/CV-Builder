"use client";

import { useQuery } from "@apollo/client/react";

import { currentAccountQuery, type CurrentAccountQueryData } from "@/entities/employee";
import { CollectionContent } from "@/shared/ui/collection-content";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import { UserSkills, UserSkillsSkeleton } from "@/widgets/user-skills";

export function SkillsPage() {
  const { data, loading, error, refetch } = useQuery<CurrentAccountQueryData>(currentAccountQuery);
  const userId = data?.me?.id;

  return <>
    <AppBreadcrumb pageName="Skills" />
    <div className="mx-auto w-full max-w-profile-content px-profile-inline py-8">
      <CollectionContent
        loading={loading}
        failed={Boolean(error) || !userId}
        empty={false}
        loadingLabel="Loading skills"
        loadingContent={<UserSkillsSkeleton />}
        errorMessage="Unable to load your account. Please try again."
        retryLabel="Retry account"
        emptyMessage="No skills added yet"
        onRetry={refetch}
      >
        {userId && <UserSkills key={userId} userId={userId} canEdit />}
      </CollectionContent>
    </div>
  </>;
}
