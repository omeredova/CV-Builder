"use client";

import { useEffect, useState } from "react";

export interface HistoryTabsOptions<T extends string> {
  initialTab: T;
  basePath: string;
  getTab: (pathname: string) => T;
}

export interface HistoryTabsState<T extends string> {
  activeTab: T;
  openTab: (tab: T) => void;
}

export function useHistoryTabs<T extends string>({ initialTab, basePath, getTab }: HistoryTabsOptions<T>): HistoryTabsState<T> {
  const [activeTab, setActiveTab] = useState<T>(initialTab);

  useEffect(() => {
    function handlePopState(): void {
      setActiveTab(getTab(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getTab]);

  function openTab(tab: T): void {
    window.history.pushState(null, "", `${basePath}/${encodeURIComponent(tab)}`);
    setActiveTab(tab);
  }

  return { activeTab, openTab };
}
