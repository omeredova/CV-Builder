import { gql } from "@apollo/client";

export const availableLanguagesQuery = gql`
  query AvailableLanguages($page: Int!) {
    languages(params: { page: $page, sort_by: "name", sort_order: "asc" }) {
      items { id name }
      total_pages
    }
  }
`;

const profileLanguageFields = gql`
  fragment ManagedProfileLanguages on Profile {
    id
    languages { name proficiency }
  }
`;

export const addProfileLanguageMutation = gql`
  mutation AddProfileLanguage($language: AddProfileLanguageInput!) {
    profile: addProfileLanguage(language: $language) { ...ManagedProfileLanguages }
  }
  ${profileLanguageFields}
`;

export const updateProfileLanguageMutation = gql`
  mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {
    profile: updateProfileLanguage(language: $language) { ...ManagedProfileLanguages }
  }
  ${profileLanguageFields}
`;

export const removeProfileLanguagesMutation = gql`
  mutation RemoveProfileLanguages($language: DeleteProfileLanguageInput!) {
    profile: deleteProfileLanguage(language: $language) { ...ManagedProfileLanguages }
  }
  ${profileLanguageFields}
`;
