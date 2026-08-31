"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

import { validatePasswordRecovery } from "../model/validation";
import { AuthFormCard } from "../../ui/AuthFormCard";

export function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const errors = useMemo(() => validatePasswordRecovery({ email }), [email]);
  const isValid = Object.keys(errors).length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setTouched(true);
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
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          type="email"
          value={email}
        />
        <Button
          className="mt-auth-submit-top w-password-recovery-button-width"
          disabled={!isValid}
          type="submit"
        >
          Reset password
        </Button>
        <Button asChild className="mt-auth-link-top" variant="ghost">
          <Link href="/account/login">Cancel</Link>
        </Button>
      </form>
    </AuthFormCard>
  );
}
