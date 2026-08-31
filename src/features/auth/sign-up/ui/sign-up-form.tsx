"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import { type SignUpValues, validateSignUp } from "../model/validation";
import { AuthFormCard } from "../../ui/AuthFormCard";

export type RegistrationError = "emailExists" | "server";

export interface SignUpFormProps {
  registrationError?: RegistrationError;
}

const INITIAL_VALUES: SignUpValues = { email: "", password: "", confirmPassword: "" };

const REGISTRATION_ERROR_MESSAGES: Record<RegistrationError, string> = {
  emailExists: "An account with this email already exists",
  server: "Something went wrong. Please try again later",
};

export function SignUpForm({ registrationError }: SignUpFormProps) {
  const [values, setValues] = useState<SignUpValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof SignUpValues, boolean>>>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const errors = useMemo(() => validateSignUp(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  function updateField(field: keyof SignUpValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function touchField(field: keyof SignUpValues): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });
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
            <FormField
              autoComplete="new-password"
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
              placeholder="Confirm Password"
              required
              type={confirmPasswordVisible ? "text" : "password"}
              value={values.confirmPassword}
            />
          </div>
          {registrationError ? (
            <p className="mt-field-message-top text-center text-xs text-primary" role="alert">
              {REGISTRATION_ERROR_MESSAGES[registrationError]}
            </p>
          ) : null}
          <Button className="mt-auth-submit-top w-ghost-button-width" disabled={!isValid} type="submit">
            Create account
          </Button>
          <Button asChild className="mt-auth-link-top" variant="ghost">
            <Link href="/account/login">I have an account</Link>
          </Button>
      </form>
    </AuthFormCard>
  );
}
