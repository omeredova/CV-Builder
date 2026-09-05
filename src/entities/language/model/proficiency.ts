import type { LanguageProficiency } from "./types";

export const languageProficiencyLevels: Readonly<Record<LanguageProficiency, number>> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6, Native: 7,
};
