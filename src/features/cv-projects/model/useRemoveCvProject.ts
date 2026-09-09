import { useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { cvProjectDetailsQuery, cvProjectsQuery, removeCvProjectMutation, type CvProjectDetailsData, type CvProjects, type CvQueryData, type CvQueryVariables } from "@/entities/cv";

export function useRemoveCvProject(cvId: string, assignmentId: string, onRemoved: () => void) {
  const client = useApolloClient();
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function confirm(): Promise<void> {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError(undefined);
    try {
      const { data } = await client.query<CvProjectDetailsData, CvQueryVariables>({ query: cvProjectDetailsQuery, variables: { cvId }, fetchPolicy: "network-only", context: { skipGlobalLoader: true } });
      const assignment = data?.cv?.projects?.find((project) => project.id === assignmentId);
      if (!assignment) throw new Error("Project is no longer assigned");
      await client.mutate<{ removeCvProject: Pick<CvProjects, "id" | "projects"> }, { project: { cvId: string; projectId: string } }>({
        mutation: removeCvProjectMutation,
        variables: { project: { cvId, projectId: assignment.project.id } },
        context: { skipGlobalLoader: true },
        update(cache, { data: result }) {
          if (result) cache.updateQuery<CvQueryData<CvProjects>>({ query: cvProjectsQuery, variables: { cvId } }, (previous) => previous?.cv ? { cv: { ...previous.cv, projects: result.removeCvProject.projects } } : previous);
        },
      });
      onRemoved();
    } catch {
      setError("Failed to remove project. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return { pending, error, confirm };
}
