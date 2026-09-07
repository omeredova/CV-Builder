import type { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

import { profileSkillsQuery, type AssignedSkill, type ProfileSkillsQueryData, type ProfileSkillsQueryVariables } from "@/entities/skill";

import { addProfileSkillMutation, availableSkillsQuery, removeProfileSkillsMutation, updateProfileSkillMutation } from "../api/skillOperations";
import type { SkillManagementOperations } from "./types";

interface AvailableSkillsData {
  skills: { items: readonly { id: string; name: string; category: { id: string } }[]; total_pages: number };
}

export function useProfileSkillOperations(userId: string, canEdit: boolean): SkillManagementOperations {
  const client = useApolloClient();

  async function save(mutation: DocumentNode, input: AssignedSkill | { name: readonly string[] }): Promise<void> {
    if (!canEdit) throw new Error("Skills cannot be changed on this profile");
    const result = await client.mutate<{ profile: ProfileSkillsQueryData["profile"] }>({
      mutation,
      variables: { skill: { userId, ...input } },
      context: { skipGlobalLoader: true },
    });
    if (!result.data?.profile) throw new Error("The profile was not returned");
    const profile = result.data.profile;
    client.cache.updateQuery<ProfileSkillsQueryData, ProfileSkillsQueryVariables>({ query: profileSkillsQuery, variables: { userId } }, (data) => data ? { ...data, profile } : data);
  }

  return {
    async loadSkills(page) {
      if (!canEdit) throw new Error("Skills cannot be changed on this profile");
      const { data } = await client.query<AvailableSkillsData>({ query: availableSkillsQuery, variables: { page }, fetchPolicy: "cache-first", context: { skipGlobalLoader: true } });
      if (!data?.skills) throw new Error("Skills were not returned");
      return {
        items: data.skills.items.map(({ id, name, category }) => ({ id, name, categoryId: category.id })),
        nextPage: page < data.skills.total_pages ? page + 1 : null,
      };
    },
    addSkill: (skill) => save(addProfileSkillMutation, skill),
    updateSkill: (skill) => save(updateProfileSkillMutation, skill),
    removeSkills: (names) => save(removeProfileSkillsMutation, { name: names }),
  };
}
