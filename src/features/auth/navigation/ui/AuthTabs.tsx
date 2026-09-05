import { NavigationTabs } from "@/shared/ui/navigation-tabs";

export type AuthTab = "signIn" | "signUp";

export interface AuthTabsProps {
  activeTab: AuthTab;
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
  return (
    <NavigationTabs
      activeValue={activeTab}
      ariaLabel="Authentication"
      items={[
        { href: "/login", label: "Sign in", value: "signIn" },
        { href: "/register", label: "Sign up", value: "signUp" },
      ]}
    />
  );
}
