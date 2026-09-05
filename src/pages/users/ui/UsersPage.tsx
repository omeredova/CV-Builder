"use client";

import { useQuery } from "@apollo/client/react";
import { usePathname } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";

import {
  createUsersQueryVariables,
  EmployeeAvatar,
  employeesQuery,
  employeeQuery,
  mapUserToEmployee,
  type EmployeeQueryData,
  mapUsersQueryResult,
  type EmployeeSortField,
  type Employee,
  type SortOrder,
  type UsersQueryData,
  type UsersQueryVariables,
} from "@/entities/employee";
import { isNoInternetError } from "@/shared/api/network-error";
import { ConnectionErrorPage } from "@/shared/ui/connection-error-page";
import { ChevronRightIcon } from "@/shared/ui/icons/ChevronRightIcon";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import { EmployeesTable } from "@/widgets/employees-table";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { getUserProfileTab, UserProfile } from "./UserProfile";

export function UsersPage() {
  const pathname = usePathname() ?? "/users";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<EmployeeSortField>();
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const deferredSearch = useDeferredValue(search);
  const profileRouteMatch = pathname.match(/^\/users\/([^/]+)\/(profile|skills|languages)$/);
  const routeUserId = profileRouteMatch ? decodeURIComponent(profileRouteMatch[1]) : null;
  const { data, error, loading: isLoading, refetch } = useQuery<
    UsersQueryData,
    UsersQueryVariables
  >(
    employeesQuery,
    {
      skip: !!routeUserId,
      variables: createUsersQueryVariables({
        limit: pageSize,
        page,
        search: deferredSearch,
        sortBy,
        sortOrder,
      }),
    },
  );
  const users = data ? mapUsersQueryResult(data.users) : null;
  const selectedForRoute = selectedEmployee && (!routeUserId || selectedEmployee.id === routeUserId) ? selectedEmployee : null;
  const needsProfile = !!routeUserId && !selectedForRoute;
  const profileQuery = useQuery<EmployeeQueryData, { id: string }>(employeeQuery, {
    variables: { id: routeUserId ?? "" },
    skip: !needsProfile,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    context: { skipGlobalLoader: true },
  });
  const activeEmployee = selectedForRoute ?? (
    needsProfile && !profileQuery.loading && !profileQuery.error && profileQuery.data?.user
      ? mapUserToEmployee(profileQuery.data.user) : null
  );

  useEffect(() => {
    function handlePopState(): void {
      if (
        selectedEmployee &&
        !window.location.pathname.startsWith(
          `/users/${encodeURIComponent(selectedEmployee.id)}/`,
        )
      ) {
        setSelectedEmployee(null);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedEmployee]);

  function handleSortChange(field: EmployeeSortField): void {
    setPage(1);
    if (sortBy === field) {
      setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortOrder("asc");
  }

  if (needsProfile && !activeEmployee) {
    return <>
      <AppBreadcrumb pageName="Employees" />
      <div className="mx-auto grid max-w-profile-content justify-items-center gap-4 p-profile-inline">
        {profileQuery.loading ? <Skeleton role="status" aria-label="Loading profile" className="h-64 w-full" /> : <>
          <p role={profileQuery.error ? "alert" : "status"}>{profileQuery.error ? "Unable to load profile" : "Employee not found"}</p>
          <Button variant="secondary" onClick={() => { void profileQuery.refetch().catch(() => undefined); }}>Retry profile</Button>
        </>}
      </div>
    </>;
  }

  if (!activeEmployee && isNoInternetError(error)) {
    return <ConnectionErrorPage onRetry={() => void refetch()} />;
  }

  if (activeEmployee) {
    return (
      <UserProfile
        key={activeEmployee.id}
        employee={activeEmployee}
        initialTab={getUserProfileTab(pathname)}
        onClose={() => setSelectedEmployee(null)}
        onProfileChange={(changes) => {
          setSelectedEmployee((current) => {
            if (current && current.id !== activeEmployee.id) return current;
            if (!window.location.pathname.startsWith(`/users/${encodeURIComponent(activeEmployee.id)}/`)) return current;
            return { ...(current ?? activeEmployee), ...changes };
          });
        }}
      />
    );
  }

  return (
    <>
      <AppBreadcrumb pageName="Employees" />
      <EmployeesTable
        employees={users?.employees ?? []}
        errorMessage={error ? "Unable to load employees" : undefined}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPage(1);
          setPageSize(nextPageSize);
        }}
        onRetry={() => void refetch()}
        onSortChange={handleSortChange}
        page={users?.page ?? page}
        pageSize={pageSize}
        renderAvatar={(employee) => (
          <EmployeeAvatar
            avatar={employee.avatar}
            email={employee.email}
            firstName={employee.firstName}
          />
        )}
        renderActions={(employee) => (
          <button
            aria-label={`Open ${[employee.firstName, employee.lastName].filter(Boolean).join(" ") || employee.email} profile`}
            className="mx-auto flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => {
              setSelectedEmployee(employee);
              window.history.pushState(
                null,
                "",
                `/users/${encodeURIComponent(employee.id)}/profile`,
              );
            }}
            type="button"
          >
            <ChevronRightIcon className="h-chevron-height w-chevron-width text-employee-chevron" />
          </button>
        )}
        searchProps={{
          onChange: (event) => {
            setPage(1);
            setSearch(event.target.value);
          },
          value: search,
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        totalPages={users?.totalPages ?? 1}
      />
    </>
  );
}
