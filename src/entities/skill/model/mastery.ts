import type { SkillMastery, SkillMasteryDisplay } from "./types";

export const MAX_SKILL_MASTERY_LEVEL = 5;

export const skillMasteryLabels: Readonly<Record<SkillMastery, string>> = {
  Novice: "Beginner",
  Advanced: "Elementary",
  Competent: "Intermediate",
  Proficient: "Advanced",
  Expert: "Expert",
};

export const skillMasteryOptions = (Object.keys(skillMasteryLabels) as SkillMastery[])
  .map((value) => ({ value, label: skillMasteryLabels[value] }));

export const skillMasteryLevels: Readonly<Record<SkillMasteryDisplay, number>> = {
  None: 0,
  Novice: 1,
  Advanced: 2,
  Competent: 3,
  Proficient: 4,
  Expert: MAX_SKILL_MASTERY_LEVEL,
};

export function getSkillMasteryDescription(mastery: SkillMasteryDisplay): string {
  if (mastery === "None") return `Level ${skillMasteryLevels.None} of ${MAX_SKILL_MASTERY_LEVEL}`;
  return `${skillMasteryLabels[mastery]}, level ${skillMasteryLevels[mastery]} of ${MAX_SKILL_MASTERY_LEVEL}`;
}
