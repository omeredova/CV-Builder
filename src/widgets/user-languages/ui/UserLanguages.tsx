"use client";

import { useQuery } from "@apollo/client/react";
import { useId, type ReactNode } from "react";

import { profileLanguagesQuery, LanguageList, type ProfileLanguagesQueryData, type ProfileLanguagesQueryVariables } from "@/entities/language";
import { LanguagesManagement, useProfileLanguageOperations } from "@/features/languages-management";
import { CollectionContent } from "@/shared/ui/collection-content";

import { UserLanguagesSkeleton } from "./UserLanguagesSkeleton";

export interface UserLanguagesProps {
  userId: string;
  actions?: ReactNode;
  canEdit?: boolean;
}

export function UserLanguages({ userId, actions, canEdit = false }: UserLanguagesProps) {
  const operations = useProfileLanguageOperations(userId, canEdit);
  const headingId = useId();
  const { data, loading, error, refetch } = useQuery<ProfileLanguagesQueryData,
  ProfileLanguagesQueryVariables>(profileLanguagesQuery, {
    variables: { userId },
    context: { skipGlobalLoader: true },
  });

  return <CollectionContent
    loading={loading && !data?.profile}
    failed={Boolean(error) || !data?.profile}
    empty={!canEdit && !data?.profile?.languages.length}
    loadingLabel="Loading languages"
    loadingContent={<UserLanguagesSkeleton />}
    errorMessage="Failed to load languages"
    retryLabel="Retry languages"
    emptyMessage="No languages added yet"
    onRetry={refetch}
    actions={actions}
  >
    {data?.profile && <section aria-labelledby={data.profile.languages.length ? headingId : undefined}>
      {data.profile.languages.length > 0 && <h2 id={headingId} className="text-base font-normal text-foreground">Current languages</h2>}
      {canEdit ? <LanguagesManagement key={userId} languages={data.profile.languages} operations={operations} /> :
        <LanguageList languages={data.profile.languages} />}
    </section>}
  </CollectionContent>;
}
