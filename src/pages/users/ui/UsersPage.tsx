"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";

import {
  createUsersQueryVariables,
  EmployeeAvatar,
  employeesQuery,
  mapUsersQueryResult,
  type EmployeeSortField,
  type SortOrder,
  type UsersQueryData,
  type UsersQueryVariables,
} from "@/entities/employee";
import { isNoInternetError } from "@/shared/api/network-error";
import { ConnectionErrorPage } from "@/shared/ui/connection-error-page";
import { ChevronRightIcon } from "@/shared/ui/icons/ChevronRightIcon";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import { EmployeesTable } from "@/widgets/employees-table";

export function UsersPage() {
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<EmployeeSortField>();
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const debouncedSearch = useDebouncedValue(search.trim());
  const page = pagination.search === debouncedSearch ? pagination.page : 1;
  if (pagination.search !== debouncedSearch) {
    setPagination({ page: 1, search: debouncedSearch });
  }
  function setPage(value: number): void {
    setPagination({ page: value, search: debouncedSearch });
  }
  const { data, error, refetch } = useSuspenseQuery<
    UsersQueryData,
    UsersQueryVariables
  >(
    employeesQuery,
    {
      errorPolicy: "all",
      variables: createUsersQueryVariables({
        limit: pageSize,
        page,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      }),
    },
  );
  const users = data ? mapUsersQueryResult(data.users) : null;
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

  return (
    <>
      <AppBreadcrumb pageName="Employees" />
      <EmployeesTable
        employees={users?.employees ?? []}
        errorMessage={error ? "Unable to load employees" : undefined}
        isLoading={false}
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
          <Link
            aria-label={`Open ${[employee.firstName, employee.lastName].filter(Boolean).join(" ") || employee.email} profile`}
            className="mx-auto flex size-9 items-center justify-center rounded-full border border-transparent outline-none transition-colors hover:border-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            href={`/users/${encodeURIComponent(employee.id)}/profile`}
          >
            <ChevronRightIcon className="h-chevron-height w-chevron-width text-employee-chevron" />
          </Link>
        )}
        searchProps={{
          onChange: (event) => {
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
