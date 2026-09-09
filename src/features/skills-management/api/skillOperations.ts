import { gql } from "@apollo/client";

export const availableSkillsQuery = gql`
  query AvailableSkills($page: Int!) {
    skills(params: { page: $page, sort_by: "name", sort_order: "asc" }) {
      items { id name category { id } }
      total_pages
    }
  }
`;

const profileSkillFields = gql`
  fragment ManagedProfileSkills on Profile {
    id
    skills { name categoryId mastery }
  }
`;

export const addProfileSkillMutation = gql`
  mutation AddProfileSkill($skill: AddProfileSkillInput!) {
    profile: addProfileSkill(skill: $skill) { ...ManagedProfileSkills }
  }
  ${profileSkillFields}
`;

export const updateProfileSkillMutation = gql`
  mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {
    profile: updateProfileSkill(skill: $skill) { ...ManagedProfileSkills }
  }
  ${profileSkillFields}
`;

export const removeProfileSkillsMutation = gql`
  mutation RemoveProfileSkills($skill: DeleteProfileSkillInput!) {
    profile: deleteProfileSkill(skill: $skill) { ...ManagedProfileSkills }
  }
  ${profileSkillFields}
`;
