"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { AuthFormCard } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import {
  type PasswordConfirmationValues,
  validatePasswordConfirmation,
} from "../../model/validation";

export type PasswordResetError = "expiredLink" | "server";

export interface PasswordResetFormProps {
  resetError?: PasswordResetError;
}

const INITIAL_VALUES: PasswordConfirmationValues = { password: "", confirmPassword: "" };

const PASSWORD_RESET_ERROR_MESSAGES: Record<PasswordResetError, string> = {
  expiredLink: "This password reset link has expired",
  server: "Something went wrong. Please try again later",
};

export function PasswordResetForm({ resetError }: PasswordResetFormProps) {
  const [values, setValues] = useState<PasswordConfirmationValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<
    Partial<Record<keyof PasswordConfirmationValues, boolean>>
  >({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const errors = useMemo(() => validatePasswordConfirmation(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  function updateField(field: keyof PasswordConfirmationValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function touchField(field: keyof PasswordConfirmationValues): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });
  }

  return (
    <AuthFormCard
      subtitle="Here you should write a new password and confirm it"
      title="Reset password"
    >
      <form className="flex w-full flex-col items-center" noValidate onSubmit={handleSubmit}>
        <div className="flex w-full flex-col items-center gap-auth-fields-gap">
          <FormField
            autoComplete="new-password"
            error={touched.password ? errors.password : undefined}
            id="new-password"
            label="New Password"
            minLength={6}
            onBlur={() => touchField("password")}
            onChange={(event) => updateField("password", event.target.value)}
            onPasswordVisibilityToggle={() => setPasswordVisible((visible) => !visible)}
            passwordIcon
            passwordVisible={passwordVisible}
            placeholder="New password"
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
            onBlur={() => touchField("confirmPassword")}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            onPasswordVisibilityToggle={() =>
              setConfirmPasswordVisible((visible) => !visible)
            }
            passwordIcon
            passwordVisible={confirmPasswordVisible}
            placeholder="Confirm password"
            required
            type={confirmPasswordVisible ? "text" : "password"}
            value={values.confirmPassword}
          />
        </div>
        {resetError ? (
          <p className="mt-field-message-top text-center text-xs text-primary" role="alert">
            {PASSWORD_RESET_ERROR_MESSAGES[resetError]}
          </p>
        ) : null}
        <Button
          className="mt-auth-submit-top w-password-reset-button-width"
          disabled={!isValid}
          type="submit"
        >
          Submit
        </Button>
        <Button asChild className="mt-auth-link-top" variant="ghost">
          <Link href="/account/login">Go to sign in</Link>
        </Button>
      </form>
    </AuthFormCard>
  );
}
