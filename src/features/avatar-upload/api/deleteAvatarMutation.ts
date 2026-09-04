import { gql } from "@apollo/client";

export interface DeleteAvatarData {
  deleteAvatar: null;
}

export interface DeleteAvatarVariables {
  avatar: { userId: string };
}

export const deleteAvatarMutation = gql`
  mutation DeleteAvatar($avatar: DeleteAvatarInput!) {
    deleteAvatar(avatar: $avatar)
  }
`;
