import { gql } from "@apollo/client";
import type { Cv, CvProjectDetails } from "@/entities/cv";
import type { AssignedLanguage } from "@/entities/language";
import type { AssignedSkill } from "@/entities/skill";

export interface PreviewCv extends Omit<Cv, "user"> {
  user: {
    id: string;
    position: { name: string } | null;
    profile: {
      first_name: string | null;
      last_name: string | null;
      languages: readonly AssignedLanguage[];
    };
  } | null;
  skills: readonly AssignedSkill[];
  projects: readonly CvProjectDetails[] | null;
}

export const cvPreviewQuery = gql`
  query CvPreview($cvId: ID!) {
    cv(cvId: $cvId) {
      id name education description
      user { id position { name } profile { first_name last_name languages { name proficiency } } }
      skills { name categoryId mastery }
      projects {
        id name domain description roles responsibilities start_date end_date
        project { id name domain description environment start_date end_date }
      }
    }
  }
`;

export const exportPdfMutation = gql`
  mutation ExportCvPdf($pdf: ExportPdfInput!) { exportPdf(pdf: $pdf) }
`;
