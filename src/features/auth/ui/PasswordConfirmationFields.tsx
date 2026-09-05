"use client";

import { PasswordField } from "@/shared/ui/password-field";

import type {
  PasswordConfirmationErrors,
  PasswordConfirmationValues,
} from "../model/validation";

type PasswordConfirmationField = keyof PasswordConfirmationValues;

export interface PasswordConfirmationFieldsProps {
  confirmPasswordPlaceholder?: string;
  fieldClassName?: string;
  containerClassName?: string;
  errors: PasswordConfirmationErrors;
  onBlur: (field: PasswordConfirmationField) => void;
  onChange: (field: PasswordConfirmationField, value: string) => void;
  passwordId?: string;
  confirmPasswordId?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  touched: Partial<Record<PasswordConfirmationField, boolean>>;
  values: PasswordConfirmationValues;
}

export function PasswordConfirmationFields({
  confirmPasswordPlaceholder = "Confirm Password",
  errors,
  fieldClassName,
  containerClassName,
  onBlur,
  onChange,
  passwordId,
  confirmPasswordId,
  passwordLabel = "Password",
  passwordPlaceholder = "Password",
  touched,
  values,
}: PasswordConfirmationFieldsProps) {
  return (
    <>
      <PasswordField
        className={fieldClassName}
        containerClassName={containerClassName}
        autoComplete="new-password"
        error={touched.password ? errors.password : undefined}
        id={passwordId}
        label={passwordLabel}
        minLength={6}
        onBlur={() => onBlur("password")}
        onChange={(event) => onChange("password", event.target.value)}
        placeholder={passwordPlaceholder}
        required
        value={values.password}
      />
      <PasswordField
        className={fieldClassName}
        containerClassName={containerClassName}
        autoComplete="new-password"
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        id={confirmPasswordId}
        label="Confirm Password"
        minLength={6}
        onBlur={() => onBlur("confirmPassword")}
        onChange={(event) => onChange("confirmPassword", event.target.value)}
        placeholder={confirmPasswordPlaceholder}
        required
        value={values.confirmPassword}
      />
    </>
  );
}
