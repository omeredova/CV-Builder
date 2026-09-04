"use client";

import { useQuery } from "@apollo/client/react";
import { usePathname } from "next/navigation";
import { useDeferredValue, useEffect, useState, useSyncExternalStore } from "react";

import {
  createUsersQueryVariables,
  EmployeeAvatar,
  employeesQuery,
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
import { getUserProfileTab, UserProfile } from "./UserProfile";

const storedEmployeeKeyPrefix = "cv-builder:user-profile:";

function parseStoredEmployee(value: string | null, userId: string): Employee | null {
  if (!value) {
    return null;
  }

  try {
    const employee: unknown = JSON.parse(value);
    if (isEmployee(employee) && employee.id === userId) return employee;
  } catch {
    return null;
  }

  return null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isEmployee(value: unknown): value is Employee {
  if (typeof value !== "object" || value === null) return false;

  const employee = value as Record<string, unknown>;
  return (
    typeof employee.id === "string" &&
    typeof employee.email === "string" &&
    isNullableString(employee.avatar) &&
    isNullableString(employee.department) &&
    isNullableString(employee.firstName) &&
    isNullableString(employee.lastName) &&
    isNullableString(employee.position)
  );
}

function subscribeToSessionStorage(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function UsersPage() {
  const pathname = usePathname() ?? "/users";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<EmployeeSortField>();
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const deferredSearch = useDeferredValue(search);
  const { data, error, loading: isLoading, refetch } = useQuery<
    UsersQueryData,
    UsersQueryVariables
  >(
    employeesQuery,
    {
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
  const profileRouteMatch = pathname.match(/^\/users\/([^/]+)\/(profile|skills|languages)$/);
  const routeUserId = profileRouteMatch ? decodeURIComponent(profileRouteMatch[1]) : null;
  const storedEmployeeJson = useSyncExternalStore(
    subscribeToSessionStorage,
    () =>
      routeUserId
        ? sessionStorage.getItem(`${storedEmployeeKeyPrefix}${routeUserId}`)
        : null,
    () => null,
  );
  const restoredEmployee = routeUserId
    ? parseStoredEmployee(storedEmployeeJson, routeUserId)
    : null;
  const activeEmployee = selectedEmployee ?? restoredEmployee;

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

  if (isNoInternetError(error)) {
    return <ConnectionErrorPage onRetry={() => void refetch()} />;
  }

  if (activeEmployee) {
    return (
      <UserProfile
        employee={activeEmployee}
        initialTab={getUserProfileTab(pathname)}
        onClose={() => setSelectedEmployee(null)}
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
              sessionStorage.setItem(
                `${storedEmployeeKeyPrefix}${employee.id}`,
                JSON.stringify(employee),
              );
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
