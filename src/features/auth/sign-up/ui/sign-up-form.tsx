"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { useApiLoaderNavigation } from "@/shared/api/use-api-loader-navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import { AUTH_SERVER_ERROR_MESSAGE } from "../../model/authError";
import type { RegistrationError } from "../model/registrationError";
import { useSignUp } from "../model/useSignUp";
import { type SignUpValues, validateSignUp } from "../model/validation";
import { AuthFormCard } from "../../ui/AuthFormCard";
import { AuthFormMessage } from "../../ui/AuthFormMessage";
import { PasswordConfirmationFields } from "../../ui/PasswordConfirmationFields";

export interface SignUpFormProps {
  registrationError?: RegistrationError;
}

const INITIAL_VALUES: SignUpValues = { email: "", password: "", confirmPassword: "" };

const REGISTRATION_ERROR_MESSAGES: Record<RegistrationError, string> = {
  emailExists: "An account with this email already exists",
  server: AUTH_SERVER_ERROR_MESSAGE,
};

export function SignUpForm({ registrationError }: SignUpFormProps) {
  const router = useRouter();
  const holdLoaderForNavigation = useApiLoaderNavigation();
  const [values, setValues] = useState<SignUpValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof SignUpValues, boolean>>>({});
  const { clearError, error: requestError, isLoading, signUp } = useSignUp();
  const errors = useMemo(() => validateSignUp(values), [values]);
  const isValid = Object.keys(errors).length === 0;
  const displayedRegistrationError = requestError ?? registrationError;

  function updateField(field: keyof SignUpValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    clearError();
  }

  function touchField(field: keyof SignUpValues): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });

    if (!isValid || isLoading) {
      return;
    }

    if (await signUp(values)) {
      holdLoaderForNavigation();
      router.push("/verify-email");
    }
  }

  return (
    <AuthFormCard subtitle="Welcome! Sign up to continue" title="Sign up now">
      <form className="flex w-full flex-col items-center" noValidate onSubmit={handleSubmit}>
          <div className="flex w-full flex-col items-center gap-auth-fields-gap">
            <FormField
              autoComplete="email"
              error={touched.email ? errors.email : undefined}
              id="email"
              inputMode="email"
              label="Email"
              onBlur={() => touchField("email")}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="Email"
              required
              value={values.email}
            />
            <PasswordConfirmationFields
              errors={errors}
              onBlur={touchField}
              onChange={updateField}
              touched={touched}
              values={values}
            />
          </div>
          <AuthFormMessage
            message={
              displayedRegistrationError
                ? REGISTRATION_ERROR_MESSAGES[displayedRegistrationError]
                : undefined
            }
          />
          <Button
            aria-busy={isLoading}
            className="mt-auth-submit-top w-ghost-button-width"
            disabled={!isValid || isLoading}
            type="submit"
          >
            Create account
          </Button>
          <Button asChild className="mt-auth-link-top" variant="ghost">
            <Link href="/login">I have an account</Link>
          </Button>
      </form>
    </AuthFormCard>
  );
}
