import { Search } from "lucide-react";

import { cn } from "@/shared/lib/class-names";
import { Input, type InputProps } from "./input";

export interface CollectionSearchProps extends Omit<InputProps, "type"> {
  "aria-label": string;
  containerClassName?: string;
}

export function CollectionSearch({ className, containerClassName, placeholder = "Search", ...props }: CollectionSearchProps) {
  return (
    <div className={cn("relative h-table-search w-table-search-width min-w-table-search-min-width", containerClassName)}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-table-search-icon top-1/2 size-table-search-icon-size -translate-y-1/2 text-table-search-icon" />
      <Input
        {...props}
        type="search"
        placeholder={placeholder}
        className={cn("h-full rounded-control border-border py-0 pr-table-search-inline pl-table-search-text text-base text-foreground placeholder:text-table-search-placeholder", className)}
      />
    </div>
  );
}
