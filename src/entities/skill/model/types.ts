export type SkillMastery = "Novice" | "Advanced" | "Competent" | "Proficient" | "Expert";

export interface AssignedSkill {
  name: string;
  categoryId: string | null;
  mastery: SkillMastery;
}

export interface SkillCategory {
  id: string;
  name: string;
  order: number;
  parent?: SkillCategory | null;
  children?: readonly SkillCategory[];
}

export interface SkillGroup {
  id: string;
  name: string;
  skills: readonly AssignedSkill[];
}
