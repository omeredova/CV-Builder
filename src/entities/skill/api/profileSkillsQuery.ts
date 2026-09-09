import { gql } from "@apollo/client";

import type { AssignedSkill, SkillCategory } from "../model/types";

export interface ProfileSkillsQueryData {
  profile: { id: string; skills: readonly AssignedSkill[] };
  skillCategories: readonly SkillCategory[];
}

export interface ProfileSkillsQueryVariables {
  userId: string;
}

export const profileSkillsQuery = gql`
  query ProfileSkills($userId: ID!) {
    profile(userId: $userId) {
      id
      skills { name categoryId mastery }
    }
    skillCategories {
      id name order
      parent { id name order }
      children { id name order }
    }
  }
`;
