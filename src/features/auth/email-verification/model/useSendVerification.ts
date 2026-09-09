"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useApiLoaderNavigation } from "@/shared/api/use-api-loader-navigation";

import { startVerificationSession } from "../../model/authSession";
import { useRequestError, type AuthRequestState } from "../../model/useRequestError";
import {
  sendVerificationMutation,
  type SendVerificationMutationData,
  type SendVerificationMutationVariables,
} from "../api/sendVerificationMutation";

export interface UseSendVerificationResult extends AuthRequestState<string> {
  sendVerification: (email: string) => Promise<void>;
}

export function useSendVerification(): UseSendVerificationResult {
  const router = useRouter();
  const holdLoaderForNavigation = useApiLoaderNavigation();
  const pending = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { clearError, error, setError } = useRequestError<string>();
  const [execute, { loading }] = useMutation<
    SendVerificationMutationData,
    SendVerificationMutationVariables
  >(sendVerificationMutation);

  async function sendVerification(email: string): Promise<void> {
    if (pending.current) return;
    pending.current = true;
    clearError();

    try {
      await execute({ variables: { email } });
      startVerificationSession();
    } catch {
      pending.current = false;
      setError("Failed to send verification email");
      return;
    }

    setIsNavigating(true);
    holdLoaderForNavigation();
    router.push("/verify-email?sent=true");
  }

  return { clearError, error, isLoading: loading || isNavigating, sendVerification };
}
