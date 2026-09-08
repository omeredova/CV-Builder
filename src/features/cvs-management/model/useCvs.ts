"use client";

import { useQuery } from "@apollo/client/react";
import { useDeferredValue, useState } from "react";
import { cvsQuery, type CvsData, type CvsVariables } from "@/entities/cv";
import { useCurrentAccount } from "@/entities/employee";

export function useCvs() {
  const accountQuery = useCurrentAccount();
  const account = accountQuery.account;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const deferredSearch = useDeferredValue(search.trim());
  const query = useQuery<CvsData, CvsVariables>(cvsQuery, {
    skip: !account,
    fetchPolicy: "network-only",
    variables: { userId: account?.id ?? "", params: { page, limit: pageSize, search: deferredSearch, sort_by: "name", sort_order: sortOrder } },
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
    changeSearch(value: string) { setSearch(value); setPage(1); },
    changePageSize(value: number) { setPageSize(value); setPage(1); },
    toggleSort() { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setPage(1); },
    refresh,
    retry() { if (accountQuery.error || !account) window.location.reload(); else refresh(); },
  };
}
