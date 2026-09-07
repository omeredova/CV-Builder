import type { AssignedLanguage } from "@/entities/language";
import { useCollectionManagement, type CollectionManagementState } from "@/shared/lib/use-collection-management";

import type { LanguageManagementOperations } from "./types";

function getLanguageKey(language: AssignedLanguage): string {
  return language.name;
}

export function useLanguageManagement(languages: readonly AssignedLanguage[], operations: Pick<LanguageManagementOperations, "removeLanguages">): CollectionManagementState<AssignedLanguage> {
  return useCollectionManagement({
    items: languages,
    getKey: getLanguageKey,
    onRemove: operations.removeLanguages,
    removeErrorMessage: "Failed to remove languages. Please try again.",
  });
}
