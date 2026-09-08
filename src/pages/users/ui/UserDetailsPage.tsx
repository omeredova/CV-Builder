"use client";

import { useQuery } from "@apollo/client/react";

import { employeeQuery, mapUserToEmployee, type EmployeeQueryData } from "@/entities/employee";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import type { UserProfileTab } from "../model/userProfileTabs";
import { UserProfile } from "./UserProfile";

export interface UserDetailsPageProps {
  userId: string;
  initialTab?: UserProfileTab;
}

export function UserDetailsPage({ userId, initialTab = "profile" }: UserDetailsPageProps) {
  const { data, loading, error, refetch } = useQuery<EmployeeQueryData, { id: string }>(employeeQuery, {
    variables: { id: userId },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    context: { skipGlobalLoader: true },
  });

  if (loading || error || !data?.user) {
    return <>
      <AppBreadcrumb pageName="Employees" pageHref="/users" />
      <div className="mx-auto grid max-w-profile-content justify-items-center gap-4 p-profile-inline">
        {loading ? <Skeleton role="status" aria-label="Loading profile" className="h-64 w-full" /> : <>
          <p role={error ? "alert" : "status"}>{error ? "Unable to load profile" : "Employee not found"}</p>
          <Button variant="secondary" onClick={() => { void refetch().catch(() => undefined); }}>Retry profile</Button>
        </>}
      </div>
    </>;
  }

  return <UserProfile key={userId} employee={mapUserToEmployee(data.user)} initialTab={initialTab} />;
}
