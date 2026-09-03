"use client";

import { useQuery } from "@apollo/client/react";
import { useDeferredValue, useState } from "react";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<EmployeeSortField>();
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
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
        renderActions={() => (
          <ChevronRightIcon className="mx-auto h-chevron-height w-chevron-width text-employee-chevron" />
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
