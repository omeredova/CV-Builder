"use client";

import { useQuery, type QueryRef } from "@apollo/client/react";
import type { ReactNode } from "react";
import { ApolloDataBoundary } from "@/shared/api/graphql/ApolloDataBoundary";

import { employeeQuery, mapUserToEmployee, type EmployeeQueryData } from "@/entities/employee";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import type { UserProfileTab } from "../model/userProfileTabs";
import { UserProfile } from "./UserProfile";

export interface UserDetailsPageProps {
  userId: string;
  initialTab?: UserProfileTab;
  tabQueryRef?: QueryRef<unknown>;
}

export function UserDetailsPage({ userId, initialTab = "profile", tabQueryRef }: UserDetailsPageProps): ReactNode {
  const { data, loading, error, refetch } = useQuery<EmployeeQueryData, { id: string }>(employeeQuery, {
    variables: { id: userId },
    fetchPolicy: "cache-first",
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

  const profile = <UserProfile key={userId} employee={mapUserToEmployee(data.user)} initialTab={initialTab} />;
  // A missing employee must take precedence over a pending or failed tab query.
  return tabQueryRef ? <ApolloDataBoundary queryRef={tabQueryRef}>{profile}</ApolloDataBoundary> : profile;
}
