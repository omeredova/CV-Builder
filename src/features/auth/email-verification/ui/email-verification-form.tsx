"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";

import { useApiLoaderNavigation } from "@/shared/api/use-api-loader-navigation";
import { Button } from "@/shared/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";

import { AUTH_SERVER_ERROR_MESSAGE } from "../../model/authError";
import { useEmailVerification } from "../model/useEmailVerification";
import { VERIFICATION_CODE_LENGTH, validateVerificationCode } from "../model/validation";
import type { VerificationError } from "../model/verificationError";
import { AuthFormCard } from "../../ui/AuthFormCard";
import { AuthFormMessage } from "../../ui/AuthFormMessage";

import { VerificationSentNotice } from "./verification-sent-notice";

export interface EmailVerificationFormProps {
  verificationError?: VerificationError;
}

const VERIFICATION_ERROR_MESSAGES: Record<VerificationError, string> = {
  expired: "Verification code has expired",
  invalid: "Invalid verification code",
  server: AUTH_SERVER_ERROR_MESSAGE,
};

export function EmailVerificationForm({ verificationError }: EmailVerificationFormProps) {
  const router = useRouter();
  const holdLoaderForNavigation = useApiLoaderNavigation();
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const { clearError, error: requestError, isLoading, verifyEmail } = useEmailVerification();
  const validationError = validateVerificationCode(code);
  const error = touched ? validationError : undefined;
  const displayedVerificationError = requestError ?? verificationError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTouched(true);

    if (validationError || isLoading) {
      return;
    }

    if (await verifyEmail(code)) {
      holdLoaderForNavigation();
      router.push("/");
    }
  }

  function handleChange(nextCode: string): void {
    setCode(nextCode);
    clearError();
  }

  return (
    <AuthFormCard
      subtitle="Enter the verification code we sent to your email."
      title="Email verification"
    >
      <form className="flex w-full flex-col items-center" noValidate onSubmit={handleSubmit}>
        <Suspense fallback={null}>
          <VerificationSentNotice />
        </Suspense>
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
        <AuthFormMessage id="verification-code-error" message={error} />
        <AuthFormMessage
          className="mt-3"
          message={
            displayedVerificationError
              ? VERIFICATION_ERROR_MESSAGES[displayedVerificationError]
              : undefined
          }
        />
        <Button
          aria-busy={isLoading}
          className="mt-10"
          disabled={Boolean(validationError) || isLoading}
          type="submit"
        >
          Confirm
        </Button>
        <Button asChild className="mt-auth-link-top" variant="ghost">
          <Link href="/">Later</Link>
        </Button>
      </form>
    </AuthFormCard>
  );
}
