import { forwardRef, type InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/class-names";
import { PasswordVisibilityIcon } from "@/shared/ui/icons/PasswordVisibilityIcon";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
  onPasswordVisibilityToggle?: () => void;
  passwordIcon?: boolean;
  passwordVisible?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      disabled,
      error,
      id,
      label,
      onPasswordVisibilityToggle,
      passwordIcon = false,
      passwordVisible = false,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const describedBy = error ? `${id}-error` : undefined;

    return (
      <div className="w-field-width max-w-full">
        <div className="relative">
          <Input
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            className={cn(
              "peer h-control-height w-full border border-border bg-transparent px-field-inline text-base font-normal text-foreground outline-none placeholder:text-placeholder hover:border-muted-foreground focus:border-muted-foreground focus:placeholder:text-transparent disabled:bg-input-disabled-background disabled:text-disabled disabled:opacity-100 disabled:placeholder:text-disabled",
              passwordIcon && "pr-field-icon",
              passwordIcon && "focus:border-foreground",
              error && "border-primary hover:border-primary focus:border-primary",
              className,
            )}
            disabled={disabled}
            id={id}
            ref={ref}
            type={type}
            {...props}
          />
          <Label
            className={cn(
              "pointer-events-none absolute bottom-full left-field-inline z-10 mb-field-label-gap text-xs font-normal leading-none text-muted-foreground opacity-100 transition-opacity peer-placeholder-shown:opacity-0 peer-autofill:opacity-100 peer-focus:opacity-100 peer-disabled:opacity-100",
              error && "text-primary peer-placeholder-shown:opacity-100",
            )}
            htmlFor={id}
          >
            {label}
          </Label>
          {passwordIcon ? (
            <button
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              className={cn(
                "absolute right-field-inline top-1/2 flex -translate-y-1/2 text-password-icon outline-none focus-visible:ring-2 focus-visible:ring-primary",
                error && "text-primary",
              )}
              onClick={onPasswordVisibilityToggle}
              type="button"
            >
              <PasswordVisibilityIcon crossed={passwordVisible} />
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="mt-field-message-top text-xs text-primary" id={describedBy} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

FormField.displayName = "FormField";
