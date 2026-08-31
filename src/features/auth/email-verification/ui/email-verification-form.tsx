"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { Button } from "@/shared/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";

import { VERIFICATION_CODE_LENGTH, validateVerificationCode } from "../model/validation";
import { AuthFormCard } from "../../ui/AuthFormCard";

export type VerificationError = "expired" | "invalid" | "server";

export interface EmailVerificationFormProps {
  verificationError?: VerificationError;
}

const VERIFICATION_ERROR_MESSAGES: Record<VerificationError, string> = {
  expired: "Verification code has expired",
  invalid: "Invalid verification code",
  server: "Something went wrong. Please try again later",
};

export function EmailVerificationForm({ verificationError }: EmailVerificationFormProps) {
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const validationError = validateVerificationCode(code);
  const error = touched ? validationError : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setTouched(true);
  }

  function handleChange(nextCode: string): void {
    setCode(nextCode);
  }

  return (
    <AuthFormCard
      subtitle="Enter the verification code we sent to your email."
      title="Email verification"
    >
      <form className="flex w-full flex-col items-center" noValidate onSubmit={handleSubmit}>
        <InputOTP
          aria-describedby={error ? "verification-code-error" : undefined}
          aria-invalid={Boolean(error)}
          aria-label="Verification code"
          autoComplete="one-time-code"
          containerClassName="justify-center"
          inputMode="numeric"
          maxLength={VERIFICATION_CODE_LENGTH}
          onBlur={() => setTouched(true)}
          onChange={handleChange}
          pasteTransformer={(pasted) => pasted.replace(/\D/g, "")}
          pattern="^\d+$"
          value={code}
        >
          <InputOTPGroup>
            {Array.from({ length: VERIFICATION_CODE_LENGTH }, (_, index) => (
              <InputOTPSlot className={error ? "border-primary" : undefined} index={index} key={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error ? (
          <p
            className="mt-field-message-top text-center text-xs text-primary"
            id="verification-code-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {verificationError ? (
          <p className="mt-3 text-center text-xs text-primary" role="alert">
            {VERIFICATION_ERROR_MESSAGES[verificationError]}
          </p>
        ) : null}
        <Button className="mt-10" disabled={Boolean(validationError)} type="submit">
          Confirm
        </Button>
        <Button asChild className="mt-auth-link-top" variant="ghost">
          <Link href="/">Later</Link>
        </Button>
      </form>
    </AuthFormCard>
  );
}
