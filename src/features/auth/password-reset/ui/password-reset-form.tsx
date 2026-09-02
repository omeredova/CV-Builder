"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { useApiLoaderNavigation } from "@/shared/api/use-api-loader-navigation";
import { Button } from "@/shared/ui/button";

import { AUTH_SERVER_ERROR_MESSAGE } from "../../model/authError";
import {
  type PasswordConfirmationValues,
  validatePasswordConfirmation,
} from "../../model/validation";
import { AuthFormCard } from "../../ui/AuthFormCard";
import { AuthFormMessage } from "../../ui/AuthFormMessage";
import { PasswordConfirmationFields } from "../../ui/PasswordConfirmationFields";
import type { PasswordResetError } from "../model/passwordResetError";
import { usePasswordReset } from "../model/usePasswordReset";

export interface PasswordResetFormProps {
  resetError?: PasswordResetError;
  token: string;
}

const INITIAL_VALUES: PasswordConfirmationValues = { password: "", confirmPassword: "" };

const PASSWORD_RESET_ERROR_MESSAGES: Record<PasswordResetError, string> = {
  expiredLink: "This password reset link has expired",
  server: AUTH_SERVER_ERROR_MESSAGE,
};

export function PasswordResetForm({ resetError, token }: PasswordResetFormProps) {
  const router = useRouter();
  const holdLoaderForNavigation = useApiLoaderNavigation();
  const [values, setValues] = useState<PasswordConfirmationValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<
    Partial<Record<keyof PasswordConfirmationValues, boolean>>
  >({});
  const { clearError, error: requestError, isLoading, resetPassword } = usePasswordReset();
  const errors = useMemo(() => validatePasswordConfirmation(values), [values]);
  const isValid = Object.keys(errors).length === 0;
  const displayedResetError = requestError ?? resetError ?? (!token ? "expiredLink" : undefined);

  function updateField(field: keyof PasswordConfirmationValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    clearError();
  }

  function touchField(field: keyof PasswordConfirmationValues): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    if (!isValid || isLoading) {
      return;
    }

    if (await resetPassword(values, token)) {
      holdLoaderForNavigation();
      router.push("/");
    }
  }

  return (
    <AuthFormCard
      subtitle="Here you should write a new password and confirm it"
      title="Reset password"
    >
      <form className="flex w-full flex-col items-center" noValidate onSubmit={handleSubmit}>
        <div className="flex w-full flex-col items-center gap-auth-fields-gap">
          <PasswordConfirmationFields
            confirmPasswordPlaceholder="Confirm password"
            errors={errors}
            onBlur={touchField}
            onChange={updateField}
            passwordId="new-password"
            passwordLabel="New Password"
            passwordPlaceholder="New password"
            touched={touched}
            values={values}
          />
        </div>
        <AuthFormMessage
          message={
            displayedResetError
              ? PASSWORD_RESET_ERROR_MESSAGES[displayedResetError]
              : undefined
          }
        />
        <Button
          aria-busy={isLoading}
          className="mt-auth-submit-top w-password-reset-button-width"
          disabled={!isValid || isLoading}
          type="submit"
        >
          Submit
        </Button>
        <Button asChild className="mt-auth-link-top" variant="ghost">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </form>
    </AuthFormCard>
  );
}
