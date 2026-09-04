import { forwardRef, type InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/class-names";
import { primaryFocusRingClassName } from "@/shared/ui/styles";
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
      <div className="relative w-field-width max-w-full">
        <div className="relative">
          <Input
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            className={cn(
              "peer",
              passwordIcon && "pr-field-icon",
              passwordIcon && !error && "focus:border-foreground",
              className,
            )}
            disabled={disabled}
            id={id}
            ref={ref}
            type={type}
            variant={error ? "invalid" : "default"}
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
                "absolute right-field-inline top-1/2 flex -translate-y-1/2 text-password-icon",
                primaryFocusRingClassName,
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
          <p
            className="absolute left-field-inline top-full mt-field-message-top text-xs text-primary"
            id={describedBy}
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

FormField.displayName = "FormField";
