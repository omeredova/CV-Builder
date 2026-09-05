import { forwardRef, type LabelHTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label className={cn("text-sm font-medium", className)} data-slot="label" ref={ref} {...props} />
));

Label.displayName = "Label";
