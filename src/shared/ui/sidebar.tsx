import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps, HTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";

export function SidebarProvider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-h-screen w-full bg-background", className)} {...props} />;
}

export function Sidebar({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "relative sticky top-0 flex h-screen w-sidebar-width shrink-0 flex-col bg-sidebar text-sidebar-item tracking-sidebar text-sidebar-foreground transition-[width] duration-sidebar",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-sidebar-header items-center px-sidebar-inline", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-h-0 flex-1 flex-col", className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-sidebar-footer-total shrink-0 px-sidebar-inline pb-sidebar-footer-bottom",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-sidebar-menu", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />;
}

export interface SidebarMenuButtonProps extends ComponentProps<"button"> {
  asChild?: boolean;
  isActive?: boolean;
}

export interface SidebarFooterMenuButtonProps extends SidebarMenuButtonProps {
  isCollapsed?: boolean;
}

export function SidebarFooterMenuButton({
  className,
  isCollapsed = false,
  ...props
}: SidebarFooterMenuButtonProps) {
  return (
    <SidebarMenuButton
      className={cn(
        "!h-sidebar-footer-menu-item !gap-sidebar-footer-menu-content !rounded-none !px-sidebar-footer-menu-inline !text-sidebar-item leading-normal tracking-normal text-sidebar-foreground hover:!rounded-none [&>svg]:!size-sidebar-footer-menu-icon [&>svg]:!text-sidebar-foreground",
        isCollapsed &&
          "!gap-0 !rounded-l-none !rounded-r-sidebar-item !px-0 justify-center [&>span]:sr-only [&>svg]:!size-sidebar-icon",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuButton({
  asChild = false,
  className,
  isActive = false,
  ...props
}: SidebarMenuButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-sidebar-item-height w-full items-center gap-sidebar-item-gap px-sidebar-item-inline font-normal text-sidebar-muted outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-sidebar-icon [&>svg]:shrink-0",
        isActive
          ? "rounded-l-none rounded-r-sidebar-item bg-sidebar-accent text-sidebar-foreground"
          : "rounded-sidebar-item hover:rounded-l-none hover:rounded-r-sidebar-item",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarInset({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <main className={cn("min-w-0 flex-1", className)} {...props} />;
}
