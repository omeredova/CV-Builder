import { gql } from "@apollo/client";

export interface UploadAvatarData {
  uploadAvatar: string;
}

export interface UploadAvatarVariables {
  avatar: { userId: string; base64: string; size: number; type: string };
}

export const uploadAvatarMutation = gql`
  mutation UploadAvatar($avatar: UploadAvatarInput!) {
    uploadAvatar(avatar: $avatar)
  }
`;
