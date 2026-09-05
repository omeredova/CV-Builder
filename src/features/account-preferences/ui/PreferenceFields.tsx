"use client";

import { Select } from "@/shared/ui/select";
import { useAccountPreferences } from "../model/PreferencesProvider";
import { languageOptions, themeOptions } from "../model/preferences";

export function PreferenceFields() {
  const { available, preferences, loading, error, updatePreference } = useAccountPreferences();
  const disabled = !available || loading;

  return (
    <div className="flex flex-col gap-5">
      <Select
        label="Theme"
        value={preferences.theme}
        options={themeOptions}
        disabled={disabled}
        onValueChange={(value) => updatePreference("theme", value)}
      />
      <Select
        label="Language"
        value={preferences.language}
        options={languageOptions}
        disabled={disabled}
        onValueChange={(value) => updatePreference("language", value)}
      />
      {loading && <p role="status" className="text-sm text-muted-foreground">Loading your preferences…</p>}
      {error && <p role="alert" className="text-sm text-primary">{error}</p>}
    </div>
  );
}
