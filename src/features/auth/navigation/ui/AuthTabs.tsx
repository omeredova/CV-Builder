import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export type AuthTab = "signIn" | "signUp";

export interface AuthTabsProps {
  activeTab: AuthTab;
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
  return (
    <Tabs className="h-auth-tabs-height max-w-auth-tabs-width">
      <TabsList aria-label="Authentication">
        <TabsTrigger active={activeTab === "signIn"} asChild>
          <Link
            aria-current={activeTab === "signIn" ? "page" : undefined}
            href="/login"
          >
            Sign in
          </Link>
        </TabsTrigger>
        <TabsTrigger active={activeTab === "signUp"} asChild>
          <Link aria-current={activeTab === "signUp" ? "page" : undefined} href="/register">
            Sign up
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
