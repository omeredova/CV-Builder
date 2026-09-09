import { useEffect, useRef, useState } from "react";

import { languageProficiencyOptions, type AssignedLanguage, type LanguageProficiency } from "@/entities/language";

import type { AvailableLanguagesPage, LanguageManagementOperations } from "./types";

export interface LanguageFormOptions {
  language?: AssignedLanguage;
  assignedLanguages: readonly AssignedLanguage[];
  operations: Pick<LanguageManagementOperations, "loadLanguages" | "addLanguage" | "updateLanguage">;
  onSaved: () => void;
}

export function useLanguageForm({ language, assignedLanguages, operations, onSaved }: LanguageFormOptions) {
  const [catalog, setCatalog] = useState<AvailableLanguagesPage | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string>();
  const [name, setName] = useState(language?.name ?? "");
  const [proficiency, setProficiency] = useState<LanguageProficiency | "">(language?.proficiency ?? "");
  const [touched, setTouched] = useState({ language: false, proficiency: false });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);
  const fetching = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const available = (catalog?.items ?? []).filter((item) => !assignedLanguages.some((assigned) => assigned.name === item.name));
  const selected = language ?? available.find((item) => item.name === name);

  async function loadMoreOptions(): Promise<void> {
    if (language || fetching.current || catalog?.nextPage === null) return;
    fetching.current = true;
    setLoadingOptions(true);
    setOptionsError(undefined);
    try {
      const page = await operations.loadLanguages(catalog?.nextPage ?? 1);
      if (mounted.current) setCatalog((previous) => ({
        items: [...new Map([...(previous?.items ?? []), ...page.items].map((item) => [item.id, item])).values()],
        nextPage: page.nextPage,
      }));
    }
    catch { setOptionsError("Failed to load available languages"); }
    finally { fetching.current = false; setLoadingOptions(false); }
  }

  async function loadOptions(): Promise<void> {
    if (!catalog || optionsError) await loadMoreOptions();
  }

  async function submit(): Promise<void> {
    setSubmitted(true);
    if (!selected || !proficiency || pending.current) return;
    pending.current = true;
    setSaving(true);
    setError(undefined);
    try {
      const input: AssignedLanguage = { name: selected.name, proficiency };
      await (language ? operations.updateLanguage(input) : operations.addLanguage(input));
      if (mounted.current) onSaved();
    } catch { setError(language ? "Failed to update language. Please try again." : "Failed to add language. Please try again."); }
    finally { pending.current = false; setSaving(false); }
  }

  return {
    name, proficiency, saving, error, loadingOptions, optionsError,
    valid: Boolean(selected && proficiency),
    hasMoreOptions: !language && catalog?.nextPage !== null,
    options: language ? [{ value: language.name, label: language.name }] : available.map((item) => ({ value: item.name, label: item.name })),
    languageError: (submitted || touched.language) && !selected ? "Language is required" : undefined,
    proficiencyError: (submitted || touched.proficiency) && !proficiency ? "Language proficiency is required" : undefined,
    touch(field: "language" | "proficiency") { setTouched((previous) => ({ ...previous, [field]: true })); },
    setName,
    setProficiency(value: string) {
      const option = languageProficiencyOptions.find((item) => item.value === value);
      if (option) setProficiency(option.value);
    },
    loadOptions, loadMoreOptions, submit,
  };
}
