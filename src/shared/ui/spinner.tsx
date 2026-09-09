import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/class-names";

export function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-label="Loading"
      role="status"
      viewBox="0 0 96 96"
      className={cn("size-4 animate-spin", className)}
      {...props}
    >
      <circle
        className="stroke-loader-track [stroke-width:var(--spacing-loader-stroke)]"
        cx="48"
        cy="48"
        fill="none"
        r="32"
      />
      <circle
        className="stroke-primary [stroke-width:var(--spacing-loader-stroke)]"
        cx="48"
        cy="48"
        fill="none"
        pathLength="100"
        r="32"
        strokeDasharray="25 75"
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
    </svg>
  );
}
