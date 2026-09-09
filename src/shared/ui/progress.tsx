"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/class-names";

export function Progress({ className, value = null, max = 100, ...props }: ComponentProps<typeof ProgressPrimitive.Root>) {
  const maximum = Number.isFinite(max) && max > 0 ? max : 100;
  const progress = value !== null && Number.isFinite(value) && value >= 0 && value <= maximum ? value : null;

  return (
    <ProgressPrimitive.Root data-slot="progress" className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)} value={progress} max={maximum} {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full bg-primary transition-transform", progress === null ? "w-1/3 animate-[progress-indeterminate_1.2s_ease-in-out_infinite] motion-reduce:animate-none" : "w-full")}
        style={progress === null ? undefined : { transform: `translateX(-${100 - (progress / maximum) * 100}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
