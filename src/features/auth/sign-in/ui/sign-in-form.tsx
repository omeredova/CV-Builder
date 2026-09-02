"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { useApiLoaderNavigation } from "@/shared/api/use-api-loader-navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import { AUTH_SERVER_ERROR_MESSAGE } from "../../model/authError";
import type { AuthenticationError } from "../model/authenticationError";
import { useSignIn } from "../model/useSignIn";
import { type SignInValues, validateSignIn } from "../model/validation";
import { AuthFormCard } from "../../ui/AuthFormCard";
import { AuthFormMessage } from "../../ui/AuthFormMessage";

export interface SignInFormProps {
  authenticationError?: AuthenticationError;
}

const INITIAL_VALUES: SignInValues = { email: "", password: "" };

const AUTHENTICATION_ERROR_MESSAGES: Record<AuthenticationError, string> = {
  invalidCredentials: "Invalid email or password",
  server: AUTH_SERVER_ERROR_MESSAGE,
};

export function SignInForm({ authenticationError }: SignInFormProps) {
  const router = useRouter();
  const holdLoaderForNavigation = useApiLoaderNavigation();
  const [values, setValues] = useState<SignInValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof SignInValues, boolean>>>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { clearError, error: requestError, isLoading, signIn } = useSignIn();
  const errors = useMemo(() => validateSignIn(values), [values]);
  const isValid = Object.keys(errors).length === 0;
  const displayedAuthenticationError = requestError ?? authenticationError;

  function updateField(field: keyof SignInValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    clearError();
  }

  function touchField(field: keyof SignInValues): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (!isValid || isLoading) {
      return;
    }

    if (await signIn(values)) {
      holdLoaderForNavigation();
      router.push("/");
    }
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
          <AuthFormMessage
            message={
              displayedAuthenticationError
                ? AUTHENTICATION_ERROR_MESSAGES[displayedAuthenticationError]
                : undefined
            }
          />
          <Button
            aria-busy={isLoading}
            className="mt-auth-submit-top"
            disabled={!isValid || isLoading}
            type="submit"
          >
            Sign in
          </Button>
          <Button asChild className="mt-auth-link-top" variant="ghost">
            <Link href="/recover-password">Forgot password</Link>
          </Button>
      </form>
    </AuthFormCard>
  );
}
