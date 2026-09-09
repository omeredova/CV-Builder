"use client";

import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { cvsQuery, type CvsData, type CvsVariables } from "@/entities/cv";
import { useCurrentAccount } from "@/entities/employee";

export function useCvs() {
  const accountQuery = useCurrentAccount();
  const account = accountQuery.account;
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(search.trim());
  const page = pagination.search === debouncedSearch ? pagination.page : 1;
  if (pagination.search !== debouncedSearch) {
    setPagination({ page: 1, search: debouncedSearch });
  }
  function setPage(value: number): void {
    setPagination({ page: value, search: debouncedSearch });
  }
  const query = useQuery<CvsData, CvsVariables>(cvsQuery, {
    skip: !account,
    fetchPolicy: "network-only",
    variables: { userId: account?.id ?? "", params: { page, limit: pageSize, search: debouncedSearch, sort_by: "name", sort_order: sortOrder } },
    context: { skipGlobalLoader: true },
  });
  const result = query.data?.cvsByUserId;
  function refresh(): void { void query.refetch().then(({ data }) => { if (data && page > Math.max(1, data.cvsByUserId.total_pages)) setPage(Math.max(1, data.cvsByUserId.total_pages)); }).catch(() => undefined); }
  return {
    account, items: result?.items ?? [],
    loading: accountQuery.loading || query.loading,
    error: accountQuery.error || query.error,
    page: result?.page ?? page, pageSize, totalPages: result?.total_pages ?? 1, search, sortOrder,
    setPage,
    changeSearch(value: string) { setSearch(value); },
    changePageSize(value: number) { setPageSize(value); setPage(1); },
    toggleSort() { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setPage(1); },
    refresh,
    retry() { if (accountQuery.error || !account) window.location.reload(); else refresh(); },
  };
}
