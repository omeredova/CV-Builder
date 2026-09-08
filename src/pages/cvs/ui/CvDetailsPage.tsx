"use client";

import { CvSkillsManagement } from "@/features/skills-management";
import { CvDetailsForm } from "@/features/cvs-management";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import { Button } from "@/shared/ui/button";
import { NavigationTabs } from "@/shared/ui/navigation-tabs";
import { Skeleton } from "@/shared/ui/skeleton";
import { cvTabs, type CvTab } from "../model/cvTabs";

import { useCvDetailsPage } from "../model/useCvDetailsPage";

interface CvDetailsPageProps { cvId: string; initialTab?: CvTab }
export function CvDetailsPage({ cvId, initialTab = "details" }: CvDetailsPageProps) {
  const { cv, cvName, detailsCv, skillsCv, account, activeTab, openTab, loading, error, retry } = useCvDetailsPage(cvId, initialTab);
  return <>
    <AppBreadcrumb pageName="CVs" pageHref="/cvs" trail={[cvName ?? "CV", cvTabs.find((tab) => tab.value === activeTab)?.label ?? "Details"]} />
    <NavigationTabs activeValue={activeTab} ariaLabel="CV details" className="ml-5 mt-1 h-profile-tabs-height overflow-x-auto"
      items={cvTabs.map((tab) => ({ ...tab, id: `cv-tab-${tab.value}`, panelId: `cv-panel-${tab.value}` }))} onValueChange={openTab} />
    <section role="tabpanel" id={`cv-panel-${activeTab}`} aria-labelledby={`cv-tab-${activeTab}`} tabIndex={0}
      className={`mx-auto w-full max-w-profile-content px-profile-inline pb-8 outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === "skills" ? "pt-8" : "pt-profile-top"}`}>
      {loading ? <Skeleton role="status" aria-label="Loading CV" className="h-64 w-full" />
        : error ? <div role="alert"><p>Failed to load CV</p><Button variant="secondary" className="mt-4" onClick={retry}>Retry</Button></div>
        : !cv ? <p role="status">CV not found</p>
        : activeTab === "details" && detailsCv ? <CvDetailsForm key={cv.id} cv={detailsCv} />
        : activeTab === "skills" && skillsCv ? <CvSkillsManagement key={cv.id} cvId={cv.id} ownerId={cv.user?.id ?? ""} skills={skillsCv.skills} canEdit={cv.user?.id === account?.id} />
        : null}
    </section>
  </>;
}
