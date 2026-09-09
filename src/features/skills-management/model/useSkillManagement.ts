import type { AssignedSkill } from "@/entities/skill";
import { useCollectionManagement, type CollectionManagementState } from "@/shared/lib/use-collection-management";

import type { SkillManagementOperations } from "./types";

function getSkillKey(skill: AssignedSkill): string {
  return skill.name;
}

export function useSkillManagement(skills: readonly AssignedSkill[], operations: Pick<SkillManagementOperations, "removeSkills">): CollectionManagementState<AssignedSkill> {
  return useCollectionManagement({
    items: skills,
    getKey: getSkillKey,
    onRemove: operations.removeSkills,
    removeErrorMessage: "Failed to remove skills. Please try again.",
  });
}
