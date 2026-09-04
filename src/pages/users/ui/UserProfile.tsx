"use client";

import { useQuery } from "@apollo/client/react";
import { ChevronDown, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import {
  EmployeeAvatar,
  type Employee,
  userCreatedAtQuery,
  type UserCreatedAtQueryData,
  type UserCreatedAtQueryVariables,
} from "@/entities/employee";
import { formatUnixDate } from "@/shared/lib/formatters";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/ui/empty";
import { Input } from "@/shared/ui/input";
import { NavigationTabs } from "@/shared/ui/navigation-tabs";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";

export interface UserProfileProps {
  employee: Employee;
  initialTab?: UserProfileTab;
  onClose?: () => void;
}

export type UserProfileTab = "languages" | "profile" | "skills";

const profileTabs: readonly { label: string; value: UserProfileTab }[] = [
  { label: "Profile", value: "profile" },
  { label: "Skills", value: "skills" },
  { label: "Languages", value: "languages" },
];

export function getUserProfileTab(pathname: string): UserProfileTab {
  const tab = pathname.split("/").at(-1);
  return tab === "skills" || tab === "languages" ? tab : "profile";
}

interface ProfileFieldProps {
  label: string;
  select?: boolean;
  value: string | null;
}

function ProfileField({ label, select = false, value }: ProfileFieldProps) {
  return (
    <label className="relative grid w-profile-field-width max-w-full gap-1 text-xs text-muted-foreground max-table-compact:w-full">
      <span className="pl-field-inline">{label}</span>
      <Input className={select ? "pr-12" : undefined} disabled value={value ?? ""} />
      {select && (
        <ChevronDown
          aria-hidden="true"
          className="absolute bottom-3 right-4 size-5 text-muted-foreground"
        />
      )}
    </label>
  );
}

export function UserProfile({ employee, initialTab = "profile", onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<UserProfileTab>(initialTab);
  const { data, error, loading } = useQuery<
    UserCreatedAtQueryData,
    UserCreatedAtQueryVariables
  >(userCreatedAtQuery, {
    skip: activeTab !== "profile",
    variables: { id: employee.id },
  });
  const displayName = [employee.firstName, employee.lastName].filter(Boolean).join(" ") || employee.email;
  const memberSince =
    data?.user?.created_at !== undefined ? formatUnixDate(data.user.created_at) : null;

  useEffect(() => {
    function handlePopState(): void {
      setActiveTab(getUserProfileTab(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function openTab(tab: UserProfileTab): void {
    window.history.pushState(null, "", `/users/${encodeURIComponent(employee.id)}/${tab}`);
    setActiveTab(tab);
  }

  return (
    <>
      <AppBreadcrumb
        onPageClick={onClose}
        pageHref="/users"
        pageName="Employees"
        trail={[
          <span className="inline-flex items-center gap-2" key="employee">
            <UserRound aria-hidden="true" className="size-5" />
            {displayName}
          </span>,
          profileTabs.find(({ value }) => value === activeTab)?.label ?? "Profile",
        ]}
      />

      <NavigationTabs
        activeValue={activeTab}
        ariaLabel="Employee details"
        className="ml-5 mt-1 h-profile-tabs-height"
        items={profileTabs}
        onValueChange={openTab}
      />

      {activeTab === "profile" ? (
        <main className="mx-auto w-full max-w-profile-content px-profile-inline pt-profile-top">
          <section className="flex flex-col items-center text-center" aria-labelledby="user-profile-name">
            <EmployeeAvatar
              avatar={employee.avatar}
              email={employee.email}
              firstName={employee.firstName}
              size="profile"
            />
            <h1
              className="mt-profile-name [font-size:var(--text-profile-name)] leading-tight text-profile-name"
              id="user-profile-name"
            >
              {displayName}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{employee.email}</p>
            <p className="mt-0.5 min-h-5 text-base text-foreground" aria-live="polite">
              {loading
                ? "Loading member date…"
                : error || !memberSince
                  ? "Member date unavailable"
                  : `A member since ${memberSince}`}
            </p>
          </section>

          <div className="mx-auto mt-profile-fields grid w-profile-fields-width max-w-full grid-cols-2 gap-x-profile-column gap-y-profile-row max-table-compact:grid-cols-1 max-table-compact:gap-y-profile-row-compact max-table-compact:justify-items-center">
            <ProfileField label="First Name" value={employee.firstName} />
            <ProfileField label="Last Name" value={employee.lastName} />
            <ProfileField label="Department" select value={employee.department} />
            <ProfileField label="Position" select value={employee.position} />
          </div>
        </main>
      ) : (
        <main className="grid min-h-[calc(100vh-var(--spacing-breadcrumb-header)-var(--spacing-profile-tabs-height))] place-items-center px-profile-inline">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No {activeTab} yet</EmptyTitle>
              <EmptyDescription>
                This employee has no {activeTab} to display.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </main>
      )}
    </>
  );
}
