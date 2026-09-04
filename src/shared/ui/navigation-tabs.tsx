import Link from "next/link";

import { cn } from "@/shared/lib/class-names";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export interface NavigationTabItem<Value extends string> {
  href?: string;
  label: string;
  value: Value;
}

export interface NavigationTabsProps<Value extends string> {
  activeValue: Value;
  ariaLabel: string;
  className?: string;
  items: readonly NavigationTabItem<Value>[];
  onValueChange?: (value: Value) => void;
}

export function NavigationTabs<Value extends string>({
  activeValue,
  ariaLabel,
  className,
  items,
  onValueChange,
}: NavigationTabsProps<Value>) {
  return (
    <Tabs className={cn("h-auth-tabs-height w-fit max-w-full", className)}>
      <TabsList
        aria-label={ariaLabel}
        style={{
          gridTemplateColumns: `repeat(${items.length}, var(--spacing-navigation-tab-width))`,
        }}
      >
        {items.map(({ href, label, value }) => {
          const isActive = activeValue === value;

          return href ? (
            <TabsTrigger active={isActive} asChild key={value}>
              <Link aria-current={isActive ? "page" : undefined} href={href}>
                {label}
              </Link>
            </TabsTrigger>
          ) : (
            <TabsTrigger
              active={isActive}
              key={value}
              onClick={() => onValueChange?.(value)}
              type="button"
            >
              {label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
