import { gql } from "@apollo/client";

const cvSkillFields = gql`
  fragment ManagedCvSkills on Cv {
    id
    skills { name categoryId mastery }
  }
`;
export const addCvSkillMutation = gql`
  mutation AddCvSkill($skill: AddCvSkillInput!) {
    cv: addCvSkill(skill: $skill) { ...ManagedCvSkills }
  }
  ${cvSkillFields}
`;
export const updateCvSkillMutation = gql`
  mutation UpdateCvSkill($skill: UpdateCvSkillInput!) {
    cv: updateCvSkill(skill: $skill) { ...ManagedCvSkills }
  }
  ${cvSkillFields}
`;
export const removeCvSkillsMutation = gql`
  mutation RemoveCvSkills($skill: DeleteCvSkillInput!) {
    cv: deleteCvSkill(skill: $skill) { ...ManagedCvSkills }
  }
  ${cvSkillFields}
`;
