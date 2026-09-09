export const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Device settings" },
] as const;

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Spanish" },
  { value: "uk", label: "Ukrainian" },
] as const;

export type ThemePreference = (typeof themeOptions)[number]["value"];
export type LanguagePreference = (typeof languageOptions)[number]["value"];

export interface Preferences {
  theme: ThemePreference;
  language: LanguagePreference;
}

export const defaultPreferences: Preferences = { theme: "system", language: "en" };
export const preferencesKey = (userId: string): string => `cv-builder:preferences:${userId}`;

export function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object") return defaultPreferences;
  return {
    theme: themeOptions.find((option) => "theme" in value && option.value === value.theme)?.value ?? "system",
    language: languageOptions.find((option) => "language" in value && option.value === value.language)?.value ?? "en",
  };
}

export function parsePreferences(value: string | null): Preferences {
  try {
    return normalizePreferences(JSON.parse(value ?? "null"));
  } catch {
    return defaultPreferences;
  }
}
