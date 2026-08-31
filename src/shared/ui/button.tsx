import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/class-names";

const buttonVariants = cva(
  "inline-flex h-control-height items-center justify-center text-sm font-medium uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:border-transparent disabled:bg-disabled disabled:text-disabled-foreground",
  {
    variants: {
      variant: {
        primary:
          "w-button-width rounded-control bg-primary text-on-primary shadow-primary hover:border hover:border-primary hover:bg-transparent hover:text-primary active:border active:border-primary active:bg-primary-active active:text-primary",
        secondary:
          "w-button-width rounded-control border border-muted-foreground text-muted-foreground hover:bg-disabled hover:text-on-primary active:bg-muted-foreground active:text-on-primary active:shadow-control-active",
        ghost:
          "w-ghost-button-width text-muted-foreground hover:border hover:border-muted-foreground active:border active:border-muted-foreground active:bg-disabled",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ asChild = false, className, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return <Component className={cn(buttonVariants({ variant }), className)} {...props} />;
}
