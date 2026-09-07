"use client";

import { useQuery } from "@apollo/client/react";

import { currentAccountQuery, type CurrentAccountQueryData } from "@/entities/employee";
import { CollectionContent } from "@/shared/ui/collection-content";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import { UserLanguages, UserLanguagesSkeleton } from "@/widgets/user-languages";

export function LanguagesPage() {
  const { data, loading, error, refetch } = useQuery<CurrentAccountQueryData>(currentAccountQuery);
  const userId = data?.me?.id;

  return <>
    <AppBreadcrumb pageName="Languages" />
    <div className="mx-auto w-full max-w-profile-content px-profile-inline py-8">
      <CollectionContent
        loading={loading}
        failed={Boolean(error) || !userId}
        empty={false}
        loadingLabel="Loading languages"
        loadingContent={<UserLanguagesSkeleton />}
        errorMessage="Unable to load your account. Please try again."
        retryLabel="Retry account"
        emptyMessage="No languages added yet"
        onRetry={refetch}
      >
        {userId && <UserLanguages key={userId} userId={userId} canEdit />}
      </CollectionContent>
    </div>
  </>;
}
