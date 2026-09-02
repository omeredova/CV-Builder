"use client";

import { useState } from "react";

import { FormField } from "@/shared/ui/form-field";

import type {
  PasswordConfirmationErrors,
  PasswordConfirmationValues,
} from "../model/validation";

type PasswordField = keyof PasswordConfirmationValues;

export interface PasswordConfirmationFieldsProps {
  confirmPasswordPlaceholder?: string;
  errors: PasswordConfirmationErrors;
  onBlur: (field: PasswordField) => void;
  onChange: (field: PasswordField, value: string) => void;
  passwordId?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  touched: Partial<Record<PasswordField, boolean>>;
  values: PasswordConfirmationValues;
}

export function PasswordConfirmationFields({
  confirmPasswordPlaceholder = "Confirm Password",
  errors,
  onBlur,
  onChange,
  passwordId = "password",
  passwordLabel = "Password",
  passwordPlaceholder = "Password",
  touched,
  values,
}: PasswordConfirmationFieldsProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <>
      <FormField
        autoComplete="new-password"
        error={touched.password ? errors.password : undefined}
        id={passwordId}
        label={passwordLabel}
        minLength={6}
        onBlur={() => onBlur("password")}
        onChange={(event) => onChange("password", event.target.value)}
        onPasswordVisibilityToggle={() => setPasswordVisible((visible) => !visible)}
        passwordIcon
        passwordVisible={passwordVisible}
        placeholder={passwordPlaceholder}
        required
        type={passwordVisible ? "text" : "password"}
        value={values.password}
      />
      <FormField
        autoComplete="new-password"
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        id="confirm-password"
        label="Confirm Password"
        minLength={6}
        onBlur={() => onBlur("confirmPassword")}
        onChange={(event) => onChange("confirmPassword", event.target.value)}
        onPasswordVisibilityToggle={() =>
          setConfirmPasswordVisible((visible) => !visible)
        }
        passwordIcon
        passwordVisible={confirmPasswordVisible}
        placeholder={confirmPasswordPlaceholder}
        required
        type={confirmPasswordVisible ? "text" : "password"}
        value={values.confirmPassword}
      />
    </>
  );
}
