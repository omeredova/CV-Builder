import type { LanguageProficiency } from "./types";

export const languageProficiencyLevels: Readonly<Record<LanguageProficiency, number>> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6, Native: 7,
};

export const languageProficiencyOptions = (["A1", "A2", "B1", "B2", "C1", "C2", "Native"] as const).map((value) => ({ value, label: value }));
