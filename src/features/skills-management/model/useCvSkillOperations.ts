import type { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { cvSkillsQuery, type CvSkills, type CvQueryData, type CvQueryVariables } from "@/entities/cv";
import { profileSkillsQuery, type ProfileSkillsQueryData, type ProfileSkillsQueryVariables, type AssignedSkill } from "@/entities/skill";
import { addCvSkillMutation, removeCvSkillsMutation, updateCvSkillMutation } from "../api/cvSkillOperations";
import type { SkillManagementOperations } from "./types";

export function useCvSkillOperations(cvId: string, ownerId: string, canEdit: boolean): SkillManagementOperations {
  const client = useApolloClient();
  const loadSkills: SkillManagementOperations["loadSkills"] = async () => {
    if (!canEdit) throw new Error("Skills cannot be changed on this CV");
    const { data } = await client.query<ProfileSkillsQueryData, ProfileSkillsQueryVariables>({
      query: profileSkillsQuery, variables: { userId: ownerId },
      fetchPolicy: "cache-first", context: { skipGlobalLoader: true },
    });
    if (!data?.profile) throw new Error("Failed to load available skills");
    return { items: data.profile.skills.map(({ name, categoryId }) => ({ id: name, name, categoryId })), nextPage: null };
  };
  async function save(mutation: DocumentNode, input: AssignedSkill | { name: readonly string[] }): Promise<void> {
    if (!canEdit) throw new Error("Skills cannot be changed on this CV");
    const result = await client.mutate<{ cv: Pick<CvSkills, "id" | "skills"> }>({
      mutation, variables: { skill: { cvId, ...input } }, context: { skipGlobalLoader: true },
    });
    if (!result.data?.cv || result.data.cv.id !== cvId) throw new Error("The selected CV was not returned");
    const skills = result.data.cv.skills;
    client.cache.updateQuery<CvQueryData<CvSkills>, CvQueryVariables>({ query: cvSkillsQuery, variables: { cvId } }, (data) => data?.cv ? { ...data, cv: { ...data.cv, skills } } : data);
  }
  return {
    loadSkills,
    addSkill: (skill) => save(addCvSkillMutation, skill),
    updateSkill: (skill) => save(updateCvSkillMutation, skill),
    removeSkills: (names) => save(removeCvSkillsMutation, { name: names }),
  };
}
