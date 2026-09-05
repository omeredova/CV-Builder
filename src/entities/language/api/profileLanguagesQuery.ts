import { gql } from "@apollo/client";

import type { AssignedLanguage } from "../model/types";

export interface ProfileLanguagesQueryData {
  profile: { id: string; languages: readonly AssignedLanguage[] } | null;
}

export interface ProfileLanguagesQueryVariables {
  userId: string;
}

export const profileLanguagesQuery = gql`
  query ProfileLanguages($userId: ID!) {
    profile(userId: $userId) {
      id
      languages { name proficiency }
    }
  }
`;
