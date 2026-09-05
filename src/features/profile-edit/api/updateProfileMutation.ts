import { gql, type DocumentNode } from "@apollo/client";
import type { EmployeeEmployment, EmploymentUpdate } from "@/entities/employee";

export interface UpdateProfileData {
  updateProfile?: { id: string; first_name: string | null; last_name: string | null } | null;
  updateUser?: EmployeeEmployment | null;
}

export interface UpdateProfileVariables {
  profile: { userId: string; first_name: string; last_name: string };
  user?: EmploymentUpdate;
}

export const updateProfileMutation = gql`
  mutation UpdateProfile($profile: UpdateProfileInput!) {
    updateProfile(profile: $profile) {
      id
      first_name
      last_name
    }
  }
`;

const updateProfileWithEmploymentMutation = gql`
  mutation UpdateProfile($profile: UpdateProfileInput!, $user: UpdateUserInput!) {
    updateProfile(profile: $profile) {
      id
      first_name
      last_name
    }
    updateUser(user: $user) {
      id
      department { id name }
      position { id name }
    }
  }
`;

export function createUpdateProfileMutation(includeEmployment = false): DocumentNode {
  return includeEmployment ? updateProfileWithEmploymentMutation : updateProfileMutation;
}
