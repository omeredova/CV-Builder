import type { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

import { profileLanguagesQuery, type AssignedLanguage, type ProfileLanguagesQueryData, type ProfileLanguagesQueryVariables } from "@/entities/language";

import { addProfileLanguageMutation, availableLanguagesQuery, removeProfileLanguagesMutation, updateProfileLanguageMutation } from "../api/languageOperations";
import type { AvailableLanguage, LanguageManagementOperations } from "./types";

interface AvailableLanguagesData {
  languages: { items: readonly AvailableLanguage[]; total_pages: number };
}

export function useProfileLanguageOperations(userId: string, canEdit: boolean): LanguageManagementOperations {
  const client = useApolloClient();

  async function save(mutation: DocumentNode, input: AssignedLanguage | { name: readonly string[] }): Promise<void> {
    if (!canEdit) throw new Error("Languages cannot be changed on this profile");
    const result = await client.mutate<{ profile: ProfileLanguagesQueryData["profile"] }>({
      mutation,
      variables: { language: { userId, ...input } },
      context: { skipGlobalLoader: true },
    });
    if (!result.data?.profile) throw new Error("The profile was not returned");
    const profile = result.data.profile;
    client.cache.updateQuery<ProfileLanguagesQueryData, ProfileLanguagesQueryVariables>({ query: profileLanguagesQuery, variables: { userId } }, (data) => data ? { ...data, profile } : data);
  }

  return {
    async loadLanguages(page) {
      if (!canEdit) throw new Error("Languages cannot be changed on this profile");
      const { data } = await client.query<AvailableLanguagesData>({ query: availableLanguagesQuery, variables: { page }, fetchPolicy: "cache-first", context: { skipGlobalLoader: true } });
      if (!data?.languages) throw new Error("Languages were not returned");
      return {
        items: data.languages.items,
        nextPage: page < data.languages.total_pages ? page + 1 : null,
      };
    },
    addLanguage: (language) => save(addProfileLanguageMutation, language),
    updateLanguage: (language) => save(updateProfileLanguageMutation, language),
    removeLanguages: (names) => save(removeProfileLanguagesMutation, { name: names }),
  };
}
