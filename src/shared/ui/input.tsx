import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/shared/lib/class-names";

export const inputVariants = cva(
  "flex w-full border bg-input-background px-field-inline [font-size:var(--text-input)] font-normal text-foreground outline-none transition-colors placeholder:[font-size:var(--text-input)] placeholder:text-placeholder focus:placeholder:text-transparent disabled:cursor-not-allowed disabled:bg-input-disabled-background disabled:text-disabled disabled:opacity-100 disabled:placeholder:text-disabled",
  {
    variants: {
      variant: {
        default: "border-border hover:border-muted-foreground focus:border-muted-foreground",
        invalid: "border-primary hover:border-primary focus:border-primary",
      },
      control: {
        input: "h-control-height",
        textarea: "min-h-28 resize-y py-field-inline",
      },
    },
    defaultVariants: { control: "input", variant: "default" },
  },
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    Omit<VariantProps<typeof inputVariants>, "control"> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, ...props }, ref) => (
    <input
      className={cn(inputVariants({ className, control: "input", variant }))}
      data-slot="input"
      ref={ref}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof inputVariants>, "control"> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => (
    <textarea
      className={cn(inputVariants({ className, control: "textarea", variant }))}
      data-slot="textarea"
      ref={ref}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
