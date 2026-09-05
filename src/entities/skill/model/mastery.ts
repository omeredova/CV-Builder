import type { SkillMastery } from "./types";

export const MAX_SKILL_MASTERY_LEVEL = 5;

export const skillMasteryLevels: Readonly<Record<SkillMastery, number>> = {
  Novice: 1,
  Advanced: 2,
  Competent: 3,
  Proficient: 4,
  Expert: MAX_SKILL_MASTERY_LEVEL,
};

export function getSkillMasteryDescription(mastery: SkillMastery): string {
  return `${mastery}, level ${skillMasteryLevels[mastery]} of ${MAX_SKILL_MASTERY_LEVEL}`;
}
