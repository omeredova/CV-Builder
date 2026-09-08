import { gql } from "@apollo/client";
import type { AssignedSkill } from "@/entities/skill/@x/cv";

export interface Cv {
  id: string;
  name: string;
  education: string | null;
  description: string;
  user: { id: string } | null;
}
export interface CvQueryData<T = Cv> { cv: T | null }
export interface CvQueryVariables { cvId: string }

export interface CvValues { name: string; education: string; description: string }
export type CvListItem = Pick<Cv, "id" | "name" | "education">;
export interface CvsData {
  cvsByUserId: { items: CvListItem[]; page: number; total_pages: number; total: number };
}
export interface CvsVariables {
  userId: string;
  params: { page: number; limit: number; search: string; sort_by: string; sort_order: string };
}
export const cvFields = gql`
  fragment CvFields on Cv { id name education description user { id } }
`;
export const cvsQuery = gql`
  query OwnCvs($userId: ID!, $params: SearchPaginationInput) {
    cvsByUserId(userId: $userId, params: $params) {
      items { id name education } page total_pages total
    }
  }
`;
export const cvQuery = gql`
  query CvDetails($cvId: ID!) {
    cv(cvId: $cvId) {
      ...CvFields
    }
  }
  ${cvFields}
`;
export interface CvSkills extends Pick<Cv, "id" | "name" | "user"> {
  skills: readonly AssignedSkill[];
}
export const cvSkillsQuery = gql`
  query CvSkills($cvId: ID!) {
    cv(cvId: $cvId) { id name user { id } skills { name categoryId mastery } }
  }
`;
export const cvHeaderQuery = gql`
  query CvHeader($cvId: ID!) {
    cv(cvId: $cvId) { id name user { id } }
  }
`;
export interface CvProject {
  id: string;
  name: string;
  domain: string;
  description: string;
  responsibilities: readonly string[];
  start_date: string;
  end_date: string | null;
}
export interface CvProjects extends Pick<Cv, "id" | "name" | "user"> {
  projects: readonly CvProject[] | null;
}
export const cvProjectsQuery = gql`
  query CvProjects($cvId: ID!) {
    cv(cvId: $cvId) {
      id name user { id }
      projects { id name domain description responsibilities start_date end_date }
    }
  }
`;
export const createCvMutation = gql`
  mutation CreateCv($cv: CreateCvInput!) { createCv(cv: $cv) { ...CvFields } }
  ${cvFields}
`;
export const updateCvMutation = gql`
  mutation UpdateCv($cv: UpdateCvInput!) { updateCv(cv: $cv) { ...CvFields } }
  ${cvFields}
`;
export const deleteCvMutation = gql`
  mutation DeleteCv($cv: DeleteCvInput!) { deleteCv(cv: $cv) { __typename } }
`;
