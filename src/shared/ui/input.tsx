import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "flex w-full border border-border bg-transparent text-foreground outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    data-slot="input"
    ref={ref}
    {...props}
  />
));

Input.displayName = "Input";
