import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";
import {
  primaryFocusRingClassName,
  standardButtonTypographyClassName,
} from "@/shared/ui/styles";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center text-sm transition-colors focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:border-transparent disabled:bg-disabled disabled:text-disabled-foreground",
    primaryFocusRingClassName,
  ),
  {
    variants: {
      variant: {
        link: "rounded-sm underline-offset-4 hover:underline",
        primary:
          cn(
            "w-button-width rounded-control bg-primary text-on-primary shadow-primary hover:border hover:border-primary hover:bg-transparent hover:text-primary active:border active:border-primary active:bg-primary-active active:text-primary",
            standardButtonTypographyClassName,
          ),
        secondary:
          cn(
            "w-button-width rounded-control border border-muted-foreground text-muted-foreground hover:bg-disabled hover:text-on-primary active:bg-muted-foreground active:text-on-primary active:shadow-control-active",
            standardButtonTypographyClassName,
          ),
        ghost:
          cn(
            "w-ghost-button-width rounded-control text-muted-foreground hover:border hover:border-muted-foreground active:border active:border-muted-foreground active:bg-disabled",
            standardButtonTypographyClassName,
          ),
        outline:
          cn(
            "rounded-control border border-border bg-transparent text-foreground hover:bg-sidebar-accent",
            standardButtonTypographyClassName,
          ),
        pagination:
          "rounded-full border border-pagination-border bg-transparent font-normal normal-case text-pagination-text hover:bg-sidebar-accent",
        paginationArrow:
          "rounded-full border border-transparent bg-transparent text-pagination-icon hover:bg-sidebar-accent",
      },
      size: {
        content: "h-auto p-0",
        default: "h-control-height",
        icon: "size-control-height p-0",
        pagination:
          "size-compact-control shrink-0 p-0 [&>svg]:h-chevron-height [&>svg]:w-chevron-width",
      },
    },
    defaultVariants: { size: "default", variant: "primary" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return <Component className={cn(buttonVariants({ size, variant }), className)} {...props} />;
}
