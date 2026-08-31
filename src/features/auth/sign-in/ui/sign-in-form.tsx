"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { AuthFormCard } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import { type SignInValues, validateSignIn } from "../model/validation";

export type AuthenticationError = "invalidCredentials" | "server";

export interface SignInFormProps {
  authenticationError?: AuthenticationError;
}

const INITIAL_VALUES: SignInValues = { email: "", password: "" };

const AUTHENTICATION_ERROR_MESSAGES: Record<AuthenticationError, string> = {
  invalidCredentials: "Invalid email or password",
  server: "Something went wrong. Please try again later.",
};

export function SignInForm({ authenticationError }: SignInFormProps) {
  const [values, setValues] = useState<SignInValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof SignInValues, boolean>>>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const errors = useMemo(() => validateSignIn(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  function updateField(field: keyof SignInValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function touchField(field: keyof SignInValues): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setTouched({ email: true, password: true });
  }

  return (
    <AuthFormCard subtitle="Hello again! Sign in to continue" title="Welcome back">
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
            <FormField
              autoComplete="current-password"
              error={touched.password ? errors.password : undefined}
              id="password"
              label="Password"
              minLength={6}
              onBlur={() => touchField("password")}
              onChange={(event) => updateField("password", event.target.value)}
              onPasswordVisibilityToggle={() => setPasswordVisible((visible) => !visible)}
              passwordIcon
              passwordVisible={passwordVisible}
              placeholder="Password"
              required
              type={passwordVisible ? "text" : "password"}
              value={values.password}
            />
          </div>
          {authenticationError ? (
            <p className="mt-field-message-top text-center text-xs text-primary" role="alert">
              {AUTHENTICATION_ERROR_MESSAGES[authenticationError]}
            </p>
          ) : null}
          <Button className="mt-auth-submit-top" disabled={!isValid} type="submit">
            Sign in
          </Button>
          <Button asChild className="mt-auth-link-top" variant="ghost">
            <Link href="/account/recover-password">Forgot password</Link>
          </Button>
      </form>
    </AuthFormCard>
  );
}
