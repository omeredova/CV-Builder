"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { useApiLoaderNavigation } from "@/shared/api/use-api-loader-navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import { AUTH_SERVER_ERROR_MESSAGE } from "../../model/authError";
import type { PasswordRecoveryError } from "../model/passwordRecoveryError";
import { usePasswordRecovery } from "../model/usePasswordRecovery";
import { validatePasswordRecovery } from "../model/validation";
import { AuthFormCard } from "../../ui/AuthFormCard";
import { AuthFormMessage } from "../../ui/AuthFormMessage";

export interface PasswordRecoveryFormProps {
  recoveryError?: PasswordRecoveryError;
}

const PASSWORD_RECOVERY_ERROR_MESSAGES: Record<PasswordRecoveryError, string> = {
  accountNotFound: "No account found with this email address",
  server: AUTH_SERVER_ERROR_MESSAGE,
};

export function PasswordRecoveryForm({ recoveryError }: PasswordRecoveryFormProps) {
  const router = useRouter();
  const holdLoaderForNavigation = useApiLoaderNavigation();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const { clearError, error: requestError, isLoading, requestPasswordReset } =
    usePasswordRecovery();
  const errors = useMemo(() => validatePasswordRecovery({ email }), [email]);
  const isValid = Object.keys(errors).length === 0;
  const displayedRecoveryError = requestError ?? recoveryError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTouched(true);

    if (!isValid || isLoading) {
      return;
    }

    if (await requestPasswordReset({ email })) {
      holdLoaderForNavigation();
      router.push("/login");
    }
  }

  function handleEmailChange(value: string): void {
    setEmail(value);
    clearError();
  }

  return (
    <AuthFormCard
      subtitle="We will send you an email with further instructions"
      title="Forgot password"
    >
      <form className="flex w-full flex-col items-center" noValidate onSubmit={handleSubmit}>
        <FormField
          autoComplete="email"
          error={touched ? errors.email : undefined}
          id="recovery-email"
          inputMode="email"
          label="Email"
          onBlur={() => setTouched(true)}
          onChange={(event) => handleEmailChange(event.target.value)}
          placeholder="Email"
          required
          type="email"
          value={email}
        />
        <AuthFormMessage
          message={
            displayedRecoveryError
              ? PASSWORD_RECOVERY_ERROR_MESSAGES[displayedRecoveryError]
              : undefined
          }
        />
        <Button
          aria-busy={isLoading}
          className="mt-auth-submit-top w-password-recovery-button-width"
          disabled={!isValid || isLoading}
          type="submit"
        >
          Reset password
        </Button>
        <Button asChild className="mt-auth-link-top" variant="ghost">
          <Link href="/login">Cancel</Link>
        </Button>
      </form>
    </AuthFormCard>
  );
}
