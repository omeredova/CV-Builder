import type { AssignedSkill } from "@/entities/skill";

export interface AvailableSkill {
  id: string;
  name: string;
  categoryId: string | null;
}

export interface SkillManagementOperations {
  loadSkills: (page: number) => Promise<AvailableSkillsPage>;
  addSkill: (skill: AssignedSkill) => Promise<void>;
  updateSkill: (skill: AssignedSkill) => Promise<void>;
  removeSkills: (names: readonly string[]) => Promise<void>;
}

export interface AvailableSkillsPage {
  items: readonly AvailableSkill[];
  nextPage: number | null;
}
