import { gql } from "@apollo/client";

export interface Project {
  id: string;
  name: string;
  domain: string;
  description: string;
  environment: readonly string[];
  start_date: string;
  end_date: string | null;
}
export interface ProjectCatalogData {
  projects: { items: Project[]; page: number; total_pages: number };
}
export const projectCatalogQuery = gql`
  query ProjectCatalog($page: Int!) {
    projects(params: { page: $page, limit: 100, sort_by: "name", sort_order: "asc" }) {
      items { id name domain description environment start_date end_date }
      page total_pages
    }
  }
`;
