import { userCreatedAtQuery } from "@/entities/employee";
import { profileLanguagesQuery } from "@/entities/language";
import { profileSkillsQuery } from "@/entities/skill";
import type { UserProfileTab } from "@/pages/users";

export function getEmployeeTabRequest(userId: string, tab: UserProfileTab) {
  if (tab === "skills") return { query: profileSkillsQuery, variables: { userId } };
  if (tab === "languages") return { query: profileLanguagesQuery, variables: { userId } };
  return { query: userCreatedAtQuery, variables: { id: userId } };
}
