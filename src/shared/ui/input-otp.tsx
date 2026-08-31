"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import type { ComponentProps } from "react";
import { useContext } from "react";

import { cn } from "@/shared/lib/class-names";

export function InputOTP({
  className,
  containerClassName,
  ...props
}: ComponentProps<typeof OTPInput>) {
  return (
    <OTPInput
      className={cn("disabled:cursor-not-allowed", className)}
      containerClassName={cn(
        "flex items-center has-disabled:opacity-50",
        containerClassName,
      )}
      {...props}
    />
  );
}

export function InputOTPGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-3 sm:gap-4", className)} {...props} />;
}

export interface InputOTPSlotProps extends ComponentProps<"div"> {
  index: number;
}

export function InputOTPSlot({ className, index, ...props }: InputOTPSlotProps) {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      className={cn(
        "relative flex h-12 w-12 items-center justify-center border border-border bg-transparent text-xl text-foreground transition-shadow",
        isActive && "z-10 border-primary ring-1 ring-primary",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-pulse bg-foreground" />
        </div>
      ) : null}
    </div>
  );
}
