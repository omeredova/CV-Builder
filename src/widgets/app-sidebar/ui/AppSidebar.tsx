"use client";

import {
  FileUser,
  Languages,
  Settings,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SignOutButton } from "@/features/auth";
import { cn } from "@/shared/lib/class-names";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { CvBuilderLogo } from "@/shared/ui/icons/CvBuilderLogo";
import { SidebarChevronIcon } from "@/shared/ui/icons/SidebarChevronIcon";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooterMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

const navigationItems = [
  { href: "/users", label: "Employees", icon: UsersRound },
  { href: "/skills", label: "Skills", icon: TrendingUp },
  { href: "/languages", label: "Languages", icon: Languages },
  { href: "/cvs", label: "CVs", icon: FileUser },
] as const;

const responsiveCollapsedFooterMenuClassName =
  "max-dashboard:!gap-0 max-dashboard:!rounded-l-none max-dashboard:!rounded-r-sidebar-item max-dashboard:!px-0 max-dashboard:justify-center max-dashboard:[&>span]:sr-only max-dashboard:[&>svg]:!size-sidebar-icon";

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Sidebar className="group/sidebar data-[collapsed=true]:w-sidebar-collapsed max-dashboard:w-sidebar-collapsed" data-collapsed={isCollapsed}>
      <SidebarHeader
        className={cn(
          "transition-[padding] duration-sidebar max-dashboard:px-sidebar-collapsed-logo",
          isCollapsed && "px-sidebar-collapsed-logo",
        )}
      >
        <Link className="flex items-center gap-sidebar-logo overflow-hidden whitespace-nowrap" href="/users">
          <CvBuilderLogo className="size-sidebar-logo-mark shrink-0" />
          <span
            className={cn(
              "leading-page-title font-medium transition-opacity duration-sidebar max-dashboard:opacity-0",
              isCollapsed && "opacity-0",
            )}
          >
            CV Builder
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex h-sidebar-toggle shrink-0 items-center justify-end">
          <button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="-mr-sidebar-toggle-offset flex size-sidebar-toggle items-center justify-center rounded-full bg-sidebar text-muted-foreground outline-none hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring max-dashboard:invisible"
            onClick={() => setIsCollapsed((currentValue) => !currentValue)}
            type="button"
          >
            <SidebarChevronIcon className="h-chevron-height w-chevron-width" />
          </button>
        </div>

        <SidebarMenu>
          {navigationItems.map(({ href, icon: Icon, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-[padding] duration-sidebar max-dashboard:px-sidebar-collapsed-item",
                  isCollapsed && "px-sidebar-collapsed-item",
                )}
                isActive={pathname === href || (href === "/users" && pathname === "/")}
              >
                <Link href={href}>
                  <Icon aria-hidden="true" />
                  <span
                    className={cn(
                      "transition-opacity duration-sidebar max-dashboard:opacity-0",
                      isCollapsed && "opacity-0",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-sidebar-footer w-full items-center gap-sidebar-profile overflow-hidden whitespace-nowrap text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              type="button"
            >
              <Avatar aria-label="Name Surname">
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "truncate font-normal transition-opacity duration-sidebar max-dashboard:opacity-0",
                  isCollapsed && "opacity-0",
                )}
              >
                Name Surname
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            alignOffset={-8}
            className={cn(
              "relative h-sidebar-footer-menu-height !gap-0 overflow-hidden rounded-sidebar-footer-menu border border-sidebar-footer-menu-border bg-sidebar-accent py-sidebar-footer-menu-block shadow-none max-dashboard:w-sidebar-collapsed",
              isCollapsed ? "w-sidebar-collapsed" : "w-sidebar-width",
            )}
            side="top"
          >
            <DropdownMenuItem asChild>
              <SidebarFooterMenuButton
                className={responsiveCollapsedFooterMenuClassName}
                isCollapsed={isCollapsed}
              >
                <UserRound aria-hidden="true" />
                <span>Profile</span>
              </SidebarFooterMenuButton>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <SidebarFooterMenuButton
                asChild
                className={responsiveCollapsedFooterMenuClassName}
                isCollapsed={isCollapsed}
              >
                <Link href="/settings">
                  <Settings aria-hidden="true" />
                  <span>Settings</span>
                </Link>
              </SidebarFooterMenuButton>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="absolute inset-x-0 top-sidebar-footer-menu-divider" />
            <DropdownMenuItem asChild>
              <SignOutButton
                className={responsiveCollapsedFooterMenuClassName}
                isCollapsed={isCollapsed}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
