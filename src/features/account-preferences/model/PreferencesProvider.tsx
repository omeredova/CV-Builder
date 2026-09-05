"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

import { useCurrentAccount } from "@/entities/employee";
import { useDocumentTheme } from "@/shared/lib/use-document-theme";
import { parsePreferences, type Preferences } from "./preferences";
import { readPreferences, savePreference, subscribeToPreferences } from "./preferencesStorage";

interface PreferencesContextValue {
  available: boolean;
  preferences: Preferences;
  loading: boolean;
  error?: string;
  updatePreference: (field: keyof Preferences, value: string) => void;
}

interface PreferencesProviderProps {
  children: ReactNode;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { account, loading, error: accountError } = useCurrentAccount();
  const [saveError, setSaveError] = useState<string>();
  const stored = useSyncExternalStore(
    subscribeToPreferences,
    () => readPreferences(account?.id),
    () => null,
  );
  const preferences = parsePreferences(stored);
  useDocumentTheme(preferences.theme);

  function updatePreference(field: keyof Preferences, value: string): void {
    if (!account) return;
    try {
      savePreference(account.id, field, value);
      setSaveError(undefined);
    } catch {
      setSaveError("Your preference could not be saved. Please allow browser storage and try again.");
    }
  }

  return (
    <PreferencesContext value={{ available: Boolean(account), preferences, loading, error: accountError ?? saveError, updatePreference }}>
      {children}
    </PreferencesContext>
  );
}

export function useAccountPreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("Account preferences require PreferencesProvider");
  return context;
}
