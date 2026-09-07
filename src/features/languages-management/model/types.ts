import type { AssignedLanguage } from "@/entities/language";

export interface AvailableLanguage {
  id: string;
  name: string;
}

export interface LanguageManagementOperations {
  loadLanguages: (page: number) => Promise<AvailableLanguagesPage>;
  addLanguage: (language: AssignedLanguage) => Promise<void>;
  updateLanguage: (language: AssignedLanguage) => Promise<void>;
  removeLanguages: (names: readonly string[]) => Promise<void>;
}

export interface AvailableLanguagesPage {
  items: readonly AvailableLanguage[];
  nextPage: number | null;
}
