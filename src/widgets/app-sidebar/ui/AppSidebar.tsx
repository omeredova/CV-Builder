"use client";

import { FileUser, Languages, TrendingUp, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/shared/lib/class-names";
import { CvBuilderLogo } from "@/shared/ui/icons/CvBuilderLogo";
import { SidebarChevronIcon } from "@/shared/ui/icons/SidebarChevronIcon";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  Sidebar,
  SidebarContent,
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

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Sidebar className="data-[collapsed=true]:w-sidebar-collapsed" data-collapsed={isCollapsed}>
      <SidebarHeader
        className={cn(
          "transition-[padding] duration-sidebar",
          isCollapsed && "px-sidebar-collapsed-logo",
        )}
      >
        <Link className="flex items-center gap-sidebar-logo overflow-hidden whitespace-nowrap" href="/users">
          <CvBuilderLogo className="size-sidebar-logo-mark shrink-0" />
          <span
            className={cn(
              "leading-page-title font-medium transition-opacity duration-sidebar",
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
            className="-mr-sidebar-toggle-offset flex size-sidebar-toggle items-center justify-center rounded-full bg-sidebar text-muted-foreground outline-none hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            onClick={() => setIsCollapsed((currentValue) => !currentValue)}
            type="button"
          >
            <SidebarChevronIcon className="h-sidebar-toggle-icon-height w-sidebar-toggle-icon-width" />
          </button>
        </div>

        <SidebarMenu>
          {navigationItems.map(({ href, icon: Icon, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-[padding] duration-sidebar",
                  isCollapsed && "px-sidebar-collapsed-item",
                )}
                isActive={pathname === href || (href === "/users" && pathname === "/")}
              >
                <Link href={href}>
                  <Icon aria-hidden="true" />
                  <span
                    className={cn(
                      "transition-opacity duration-sidebar",
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
        <div className="flex h-sidebar-footer items-center gap-sidebar-profile overflow-hidden whitespace-nowrap">
          <Avatar aria-label="Name Surname">
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "truncate font-normal transition-opacity duration-sidebar",
              isCollapsed && "opacity-0",
            )}
          >
            Name Surname
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
