import { gql } from "@apollo/client";

export interface UpdateProfileData {
  updateProfile?: { id: string; first_name: string | null; last_name: string | null } | null;
  uploadAvatar?: string | null;
  deleteAvatar?: null;
}

export interface UpdateProfileVariables {
  profile: { userId: string; first_name: string; last_name: string };
  avatar?: { userId: string; base64: string; size: number; type: string } | { userId: string };
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

export const updateProfileWithAvatarMutation = gql`
  mutation UpdateProfileWithAvatar($profile: UpdateProfileInput!, $avatar: UploadAvatarInput!) {
    uploadAvatar(avatar: $avatar)
    updateProfile(profile: $profile) {
      id
      first_name
      last_name
    }
  }
`;

export const updateProfileWithoutAvatarMutation = gql`
  mutation UpdateProfileWithoutAvatar($profile: UpdateProfileInput!, $avatar: DeleteAvatarInput!) {
    deleteAvatar(avatar: $avatar)
    updateProfile(profile: $profile) {
      id
      first_name
      last_name
    }
  }
`;
