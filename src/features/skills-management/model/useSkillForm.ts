import { useEffect, useRef, useState } from "react";

import { skillMasteryOptions, type AssignedSkill, type SkillMastery } from "@/entities/skill";

import type { AvailableSkillsPage, SkillManagementOperations } from "./types";

export interface SkillFormOptions {
  skill?: AssignedSkill;
  assignedSkills: readonly AssignedSkill[];
  operations: SkillManagementOperations;
  onSaved: () => void;
}

export function useSkillForm({ skill, assignedSkills, operations, onSaved }: SkillFormOptions) {
  const [catalog, setCatalog] = useState<AvailableSkillsPage | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string>();
  const [name, setName] = useState(skill?.name ?? "");
  const [mastery, setMastery] = useState<SkillMastery | "">(skill?.mastery ?? "");
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
  const available = (catalog?.items ?? []).filter((item) => !assignedSkills.some((assigned) => assigned.name === item.name));
  const selected = skill ?? available.find((item) => item.name === name);

  async function loadMoreOptions(): Promise<void> {
    if (skill || fetching.current || catalog?.nextPage === null) return;
    fetching.current = true;
    setLoadingOptions(true);
    setOptionsError(undefined);
    try {
      const page = await operations.loadSkills(catalog?.nextPage ?? 1);
      if (mounted.current) setCatalog((previous) => ({
        items: [...new Map([...(previous?.items ?? []), ...page.items].map((item) => [item.id, item])).values()],
        nextPage: page.nextPage,
      }));
    }
    catch { setOptionsError("Failed to load available skills"); }
    finally { fetching.current = false; setLoadingOptions(false); }
  }

  async function loadOptions(): Promise<void> {
    if (!catalog || optionsError) await loadMoreOptions();
  }

  async function submit(): Promise<void> {
    setSubmitted(true);
    if (!selected || !mastery || pending.current) return;
    pending.current = true;
    setSaving(true);
    setError(undefined);
    try {
      const input: AssignedSkill = { name: selected.name, categoryId: selected.categoryId, mastery };
      await (skill ? operations.updateSkill(input) : operations.addSkill(input));
      if (mounted.current) onSaved();
    } catch { setError(skill ? "Failed to update skill. Please try again." : "Failed to add skill. Please try again."); }
    finally { pending.current = false; setSaving(false); }
  }

  return {
    name, mastery, saving, error, loadingOptions, optionsError,
    hasMoreOptions: !skill && catalog?.nextPage !== null,
    options: skill ? [{ value: skill.name, label: skill.name }] : available.map((item) => ({ value: item.name, label: item.name })),
    skillError: submitted && !selected ? "Skill is required" : undefined,
    masteryError: submitted && !mastery ? "Skill mastery is required" : undefined,
    setName,
    setMastery(value: string) {
      const option = skillMasteryOptions.find((item) => item.value === value);
      if (option) setMastery(option.value);
    },
    loadOptions, loadMoreOptions, submit,
  };
}
