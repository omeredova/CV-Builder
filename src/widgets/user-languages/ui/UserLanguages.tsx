"use client";

import { useQuery } from "@apollo/client/react";
import { useId, type ReactNode } from "react";

import { profileLanguagesQuery, LanguageList, type ProfileLanguagesQueryData, type ProfileLanguagesQueryVariables } from "@/entities/language";
import { CollectionContent } from "@/shared/ui/collection-content";

import { UserLanguagesSkeleton } from "./UserLanguagesSkeleton";

export interface UserLanguagesProps {
  userId: string;
  actions?: ReactNode;
}

export function UserLanguages({ userId, actions }: UserLanguagesProps) {
  const headingId = useId();
  const { data, loading, error, refetch } = useQuery<ProfileLanguagesQueryData,
  ProfileLanguagesQueryVariables>(profileLanguagesQuery, {
    variables: { userId },
    context: { skipGlobalLoader: true },
  });

  return <CollectionContent
    loading={loading}
    failed={Boolean(error) || !data?.profile}
    empty={!data?.profile?.languages.length}
    loadingLabel="Loading languages"
    loadingContent={<UserLanguagesSkeleton />}
    errorMessage="Failed to load languages"
    retryLabel="Retry languages"
    emptyMessage="No languages here"
    onRetry={refetch}
    actions={actions}
  >
    {data?.profile && <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-base font-normal text-foreground">Current languages</h2>
      <LanguageList languages={data.profile.languages} />
    </section>}
  </CollectionContent>;
}
