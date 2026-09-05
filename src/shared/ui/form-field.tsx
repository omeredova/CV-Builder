import { forwardRef } from "react";

import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/class-names";
import { primaryFocusRingClassName } from "@/shared/ui/styles";
import { PasswordVisibilityIcon } from "@/shared/ui/icons/PasswordVisibilityIcon";

export interface FormFieldProps extends InputProps {
  containerClassName?: string;
  labelPlacement?: "floating" | "above";
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
      containerClassName,
      disabled,
      error,
      id,
      label,
      labelPlacement = "floating",
      onPasswordVisibilityToggle,
      passwordIcon = false,
      passwordVisible = false,
      type = "text",
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const describedBy = error ? `${id}-error` : undefined;

    return (
      <div className={cn("relative max-w-full", containerClassName ?? "w-field-width")}>
        {labelPlacement === "above" && (
          <Label className="mb-field-label-gap block pl-field-inline text-xs font-normal text-muted-foreground" htmlFor={id}>
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            className={cn(
              "peer",
              variant === "active" && "bg-transparent",
              passwordIcon && "pr-field-icon",
              passwordIcon && !error && "focus:border-foreground",
              className,
            )}
            disabled={disabled}
            id={id}
            ref={ref}
            type={type}
            variant={error ? "invalid" : variant}
            {...props}
          />
          {labelPlacement === "floating" && <Label
            className={cn(
              "pointer-events-none absolute bottom-full left-field-inline z-10 mb-field-label-gap text-xs font-normal leading-none text-muted-foreground opacity-100 transition-opacity peer-placeholder-shown:opacity-0 peer-autofill:opacity-100 peer-focus:opacity-100 peer-disabled:opacity-100",
              error && "text-primary peer-placeholder-shown:opacity-100",
            )}
            htmlFor={id}
          >
            {label}
          </Label>}
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
