import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { cvQuery, cvSkillsQuery, cvProjectsQuery, cvHeaderQuery, type Cv, type CvSkills, type CvProjects, type CvQueryData, type CvQueryVariables } from "@/entities/cv";
import { useCurrentAccount } from "@/entities/employee";
import { useHistoryTabs } from "@/shared/lib/use-history-tabs";
import { getCvTab, type CvTab } from "./cvTabs";

export function useCvDetailsPage(cvId: string, initialTab: CvTab) {
  const [lastHeader, setLastHeader] = useState<{ id: string; ownerId: string; name: string }>();
  const { activeTab, openTab } = useHistoryTabs({
    initialTab, basePath: `/cvs/${encodeURIComponent(cvId)}`, getTab: getCvTab,
  });
  const { account, loading: accountLoading, error: accountError } = useCurrentAccount();
  const details = useQuery<CvQueryData, CvQueryVariables>(cvQuery, {
    fetchPolicy: "network-only", variables: { cvId }, skip: !account || activeTab !== "details", context: { skipGlobalLoader: true },
  });
  const skills = useQuery<CvQueryData<CvSkills>, CvQueryVariables>(cvSkillsQuery, {
    fetchPolicy: "network-only", variables: { cvId }, skip: !account || activeTab !== "skills", context: { skipGlobalLoader: true },
  });
  const header = useQuery<CvQueryData<Pick<Cv, "id" | "name" | "user">>, CvQueryVariables>(cvHeaderQuery, {
    fetchPolicy: "network-only", variables: { cvId }, skip: !account || activeTab !== "preview", context: { skipGlobalLoader: true },
  });
  const projects = useQuery<CvQueryData<CvProjects>, CvQueryVariables>(cvProjectsQuery, {
    fetchPolicy: "network-only", variables: { cvId }, skip: !account || activeTab !== "projects", context: { skipGlobalLoader: true },
  });
  const query = activeTab === "details" ? details : activeTab === "skills" ? skills : activeTab === "projects" ? projects : header;
  const cv = query.data?.cv?.user?.id === account?.id ? query.data?.cv : undefined;

  if (cv && account && (lastHeader?.id !== cvId || lastHeader.ownerId !== account.id || lastHeader.name !== cv.name)) {
    setLastHeader({ id: cvId, ownerId: account.id, name: cv.name });
  }
  const cvName = cv?.name ?? (lastHeader?.id === cvId && lastHeader.ownerId === account?.id ? lastHeader.name : undefined);

  function retry(): void {
    if (accountError) window.location.reload();
    else void query.refetch().catch(() => undefined);
  }

  return { cv, cvName, detailsCv: details.data?.cv, skillsCv: skills.data?.cv, projectsCv: projects.data?.cv, account, activeTab, openTab, loading: query.loading || accountLoading, error: query.error || accountError, retry };
}
