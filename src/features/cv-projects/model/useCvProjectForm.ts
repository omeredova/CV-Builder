import { useEffect, useRef, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { addCvProjectMutation, updateCvProjectMutation, cvProjectsQuery, type AddCvProjectInput, type CvProjects, type CvQueryData, type CvProjectDetails } from "@/entities/cv";
import { fetchEmploymentOptions, type EmploymentOption } from "@/entities/employee";
import { projectCatalogQuery, type ProjectCatalogData } from "@/entities/project";
import { validateProject, type ProjectValues } from "./projectValidation";

export function useCvProjectForm(cvId: string, onSaved: () => void, assignment?: CvProjectDetails) {
  const client = useApolloClient();
  const editing = !!assignment;
  const initialValues: ProjectValues = assignment ? {
    projectId: assignment.project.id, start_date: assignment.start_date, end_date: assignment.end_date ?? "",
    roles: [...assignment.roles], responsibilities: assignment.responsibilities.join("\n"),
  } : { projectId: "", start_date: "", end_date: "", roles: [], responsibilities: "" };
  const [values, setValues] = useState<ProjectValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof ProjectValues, boolean>>>({});
  const [roles, setRoles] = useState<EmploymentOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string>();
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string>();
  const [pageError, setPageError] = useState<string>();
  const submitting = useRef(false);
  const catalog = useQuery<ProjectCatalogData, { page: number }>(projectCatalogQuery, { skip: editing, variables: { page: 1 }, fetchPolicy: "cache-first", context: { skipGlobalLoader: true } });
  const [save, { loading }] = useMutation<{ addCvProject?: Pick<CvProjects, "id" | "projects">; updateCvProject?: Pick<CvProjects, "id" | "projects"> }, { project: AddCvProjectInput }>(editing ? updateCvProjectMutation : addCvProjectMutation);
  const projects = assignment ? [assignment.project] : catalog.data?.projects.items ?? [];
  const selectedProject = projects.find((project) => project.id === values.projectId);
  const errors = validateProject(values, selectedProject);

  useEffect(() => {
    let cancelled = false;
    fetchEmploymentOptions(client, "position").then((items) => {
      if (!cancelled) { setRoles(items); setRolesError(undefined); }
    }).catch(() => {
      if (!cancelled) setRolesError("Failed to load roles");
    }).finally(() => { if (!cancelled) setRolesLoading(false); });
    return () => { cancelled = true; };
  }, [client, retryCount]);

  function change<K extends keyof ProjectValues>(field: K, value: ProjectValues[K]): void {
    setValues((previous) => ({ ...previous, [field]: value }));
    setTouched((previous) => ({ ...previous, [field]: true }));
    setError(undefined);
  }
  function selectProject(projectId: string): void {
    if (editing) return;
    const project = projects.find((item) => item.id === projectId);
    setValues((previous) => ({ ...previous, projectId, start_date: project?.start_date ?? "", end_date: project?.end_date ?? "" }));
    setTouched({});
    setError(undefined);
  }
  async function loadMore(): Promise<void> {
    if (catalog.loading || !catalog.data || catalog.data.projects.page >= catalog.data.projects.total_pages) return;
    setPageError(undefined);
    try {
      await catalog.fetchMore({ variables: { page: catalog.data.projects.page + 1 }, updateQuery: (previous, { fetchMoreResult }) => ({ projects: { ...fetchMoreResult.projects, items: [...previous.projects.items, ...fetchMoreResult.projects.items] } }) });
    } catch { setPageError("Failed to load more projects"); }
  }
  const changed = values.start_date !== initialValues.start_date || values.end_date !== initialValues.end_date ||
    values.responsibilities !== initialValues.responsibilities || JSON.stringify([...values.roles].sort()) !== JSON.stringify([...initialValues.roles].sort());
  const valid = (!editing || changed) && !Object.keys(errors).length && !rolesLoading && !rolesError && values.roles.every((role) => roles.some((option) => option.name === role));
  async function submit(): Promise<void> {
    if (submitting.current) return;
    setTouched({ projectId: true, start_date: true, end_date: true, roles: true });
    if (!valid) return;
    submitting.current = true;
    setError(undefined);
    try {
      await save({ variables: { project: { cvId, projectId: values.projectId, start_date: values.start_date, end_date: values.end_date || null, roles: values.roles, responsibilities: values.responsibilities.split("\n").map((line) => line.trim()).filter(Boolean) } }, update(cache, { data }) {
        const result = data?.updateCvProject ?? data?.addCvProject;
        if (result) cache.updateQuery<CvQueryData<CvProjects>>({ query: cvProjectsQuery, variables: { cvId } }, (previous) => previous?.cv ? { cv: { ...previous.cv, projects: result.projects } } : previous);
      } });
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error && cause.message.includes("projectHasBeenAdded") ? "This project has already been added to the CV" : `Failed to ${editing ? "update" : "add"} project. Please try again.`);
    } finally { submitting.current = false; }
  }
  return {
    editing, values, selectedProject, projects, roles, rolesLoading, rolesError, loading, valid, error,
    catalogLoading: catalog.loading, catalogError: catalog.error ? "Failed to load projects" : pageError,
    hasMore: !!catalog.data && catalog.data.projects.page < catalog.data.projects.total_pages,
    loadMore, retryCatalog: () => { setPageError(undefined); void catalog.refetch().catch(() => undefined); },
    retryRoles: () => { setRolesLoading(true); setRetryCount((previous) => previous + 1); },
    fieldError: (field: keyof ProjectValues) => touched[field] ? errors[field] : undefined,
    blur: (field: keyof ProjectValues) => setTouched((previous) => ({ ...previous, [field]: true })),
    change, selectProject, submit,
  };
}
