"use client";

import { useQuery } from "@apollo/client/react";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import {
  currentProfileQuery,
  type CurrentProfileQueryData,
  type Employee,
  userCreatedAtQuery,
  type UserCreatedAtQueryData,
  type UserCreatedAtQueryVariables,
} from "@/entities/employee";
import { AvatarUploader, useProfileEdit, type ProfileChanges } from "@/features/profile-edit";
import { useSendVerification } from "@/features/auth";
import { formatUnixDate } from "@/shared/lib/formatters";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/ui/empty";
import { Skeleton } from "@/shared/ui/skeleton";
import { Select } from "@/shared/ui/select";
import { FormField } from "@/shared/ui/form-field";
import { Button } from "@/shared/ui/button";
import { NavigationTabs } from "@/shared/ui/navigation-tabs";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";

export interface UserProfileProps {
  employee: Employee;
  initialTab?: UserProfileTab;
  onClose?: () => void;
  onProfileChange?: (changes: ProfileChanges) => void;
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

export function UserProfile({ employee, initialTab = "profile", onClose, onProfileChange }: UserProfileProps) {
  const { data: currentProfile, loading: isCheckingOwner, error: ownerError, refetch: retryOwner } = useQuery<CurrentProfileQueryData>(currentProfileQuery);
  const canUpload = !ownerError && currentProfile?.me.id === employee.id;
  const profile = useProfileEdit(employee, canUpload, onProfileChange);
  const verification = useSendVerification();
  const [activeTab, setActiveTab] = useState<UserProfileTab>(initialTab);
  const { data, error, loading, refetch: retryDate } = useQuery<
    UserCreatedAtQueryData,
    UserCreatedAtQueryVariables
  >(userCreatedAtQuery, {
    skip: activeTab !== "profile",
    context: { skipGlobalLoader: true },
    variables: { id: employee.id },
  });
  const displayName = [profile.saved.firstName, profile.saved.lastName].filter(Boolean).join(" ") || employee.email;
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
        items={profileTabs.map((tab) => ({ ...tab, id: `employee-tab-${tab.value}`, panelId: `employee-panel-${tab.value}` }))}
        onValueChange={openTab}
      />

      {ownerError && (
        <div role="alert" className="mx-auto flex max-w-profile-content items-center justify-center gap-3 px-profile-inline py-3">
          <p>Unable to check profile editing access.</p>
          <Button variant="secondary" disabled={isCheckingOwner} onClick={() => { void retryOwner().catch(() => undefined); }}>Retry access check</Button>
        </div>
      )}

      {activeTab === "profile" ? (
        <div role="tabpanel" id={`employee-panel-${activeTab}`} aria-labelledby={`employee-tab-${activeTab}`} tabIndex={0} className="mx-auto w-full max-w-profile-content px-profile-inline pt-profile-top">
          <section className="flex flex-col items-center text-center" aria-labelledby="user-profile-name">
            <AvatarUploader
              canUpload={canUpload}
              employee={{ ...employee, ...profile.saved }}
              isCheckingOwner={isCheckingOwner}
              key={employee.id}
              avatar={profile.avatar}
              error={profile.avatarError}
              status={profile.status}
              onSelect={profile.selectAvatar}
              onRemove={profile.removeAvatar}
            />
            <h1
              className="mt-profile-name [font-size:var(--text-profile-name)] leading-tight text-profile-name"
              id="user-profile-name"
            >
              {displayName}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{employee.email}</p>
            <div className="mt-0.5 flex min-h-6 items-center text-base text-foreground" aria-live="polite">
              {loading
                ? <Skeleton className="h-5 w-64" role="status" aria-label="Loading membership date" />
                : error || !memberSince
                  ? <>
                      <span>Member date unavailable</span>
                      <Button className="ml-3" variant="secondary" onClick={() => { void retryDate().catch(() => undefined); }}>Retry membership date</Button>
                    </>
                  : `A member since ${memberSince}`}
            </div>
          </section>

          <form noValidate onSubmit={(event) => { event.preventDefault(); void profile.submit(); }} className="mx-auto mt-profile-fields grid w-profile-fields-width max-w-full grid-cols-2 gap-x-profile-column gap-y-profile-row max-table-compact:grid-cols-1 max-table-compact:gap-y-profile-row-compact max-table-compact:justify-items-center">
            {([
              { id: "first-name", label: "First Name", value: profile.firstName, setValue: profile.setFirstName, error: profile.firstNameError, autoComplete: "given-name" },
              { id: "last-name", label: "Last Name", value: profile.lastName, setValue: profile.setLastName, error: profile.lastNameError, autoComplete: "family-name" },
            ]).map((field) => (
              <FormField
                key={field.id}
                id={field.id}
                label={field.label}
                containerClassName="w-profile-field-width max-table-compact:w-full"
                labelPlacement="above"
                variant={canUpload ? "active" : "default"}
                type="text"
                autoComplete={field.autoComplete}
                required
                maxLength={100}
                disabled={!canUpload}
                readOnly={profile.loading}
                value={field.value}
                onChange={(event) => field.setValue(event.target.value)}
                error={canUpload ? field.error : undefined}
              />
            ))}
            {(["department", "position"] as const).map((field) => {
              const state = profile.employment.options[field];
              const selected = profile.employment.selection[field];
              const saved = profile.employment.saved[field];
              return <Select
                key={field}
                required
                label={field === "department" ? "Department" : "Position"}
                className="w-profile-field-width max-table-compact:w-full"
                value={selected?.id ?? profile.employment.saved[`${field}Id`] ?? ""}
                displayValue={selected?.name ?? saved ?? undefined}
                options={state.items.map((item) => ({ value: item.id, label: item.name }))}
                disabled={!canUpload || profile.loading}
                loading={state.loading}
                error={canUpload ? state.error ?? profile.employment.validationErrors[field] : undefined}
                onOpen={() => { void profile.employment.loadOptions(field); }}
                onValueChange={(value) => profile.employment.select(field, value)}
              />;
            })}
            {canUpload && (
              <>
                {profile.error && <p role="alert" className="text-sm text-primary col-span-2 max-table-compact:col-span-1">{profile.error}</p>}
                {verification.error && <p role="alert" className="text-sm text-primary col-span-2 max-table-compact:col-span-1">{verification.error}</p>}
                <div className="col-start-2 mt-4 flex w-full justify-end gap-6 max-table-compact:col-start-1 max-table-compact:mt-5">
                  <Button type="button" size="default" variant="secondary" disabled={verification.isLoading} aria-busy={verification.isLoading} onClick={() => { if (canUpload) void verification.sendVerification(employee.email); }}>VERIFY EMAIL</Button>
                  <Button type="submit" size="default" variant="primary" disabled={!profile.canSubmit} aria-busy={profile.loading}>UPDATE</Button>
                </div>
              </>
            )}
          </form>
        </div>
      ) : (
        <div role="tabpanel" id={`employee-panel-${activeTab}`} aria-labelledby={`employee-tab-${activeTab}`} tabIndex={0} className="grid min-h-[calc(100vh-var(--spacing-breadcrumb-header)-var(--spacing-profile-tabs-height))] place-items-center px-profile-inline">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No {activeTab} yet</EmptyTitle>
              <EmptyDescription>
                This employee has no {activeTab} to display.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </>
  );
}
