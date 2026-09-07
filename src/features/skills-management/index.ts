export { SkillsManagement, type SkillsManagementProps } from "./ui/SkillsManagement";
export { useProfileSkillOperations } from "./model/useProfileSkillOperations";
export type { AvailableSkill, AvailableSkillsPage, SkillManagementOperations } from "./model/types";
export { availableSkillsQuery, addProfileSkillMutation, updateProfileSkillMutation, removeProfileSkillsMutation } from "./api/skillOperations";
