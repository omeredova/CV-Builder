import { gql } from "@apollo/client";
import type { SkillCategory } from "../model/types";

export interface SkillCategoriesQueryData { skillCategories: readonly SkillCategory[] }
export const skillCategoriesQuery = gql`
  query SkillCategories {
    skillCategories {
      id name order
      parent { id name order }
      children { id name order }
    }
  }
`;
