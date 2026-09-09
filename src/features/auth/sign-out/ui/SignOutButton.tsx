"use client";

import { LogOut } from "lucide-react";

import {
  SidebarFooterMenuButton,
  type SidebarFooterMenuButtonProps,
} from "@/shared/ui/sidebar";

import { useSignOut } from "../model/useSignOut";

export type SignOutButtonProps = Omit<SidebarFooterMenuButtonProps, "children">;

export function SignOutButton({
  className,
  isCollapsed = false,
  onClick,
  ...props
}: SignOutButtonProps) {
  const { signOut } = useSignOut();

  return (
    <SidebarFooterMenuButton
      className={className}
      isCollapsed={isCollapsed}
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          void signOut();
        }
      }}
    >
      <LogOut aria-hidden="true" />
      <span>Logout</span>
    </SidebarFooterMenuButton>
  );
}
