"use server";

import { headers } from "next/headers";
import { createBackendClient } from "@/shared/api/create-backend-client";
import { signInMutation, type SignInMutationData } from "../sign-in/api/signInMutation";
import { signUpMutation, type SignUpMutationData } from "../sign-up/api/signUpMutation";
import { validateSignIn, type SignInValues } from "../sign-in/model/validation";
import { validateSignUp, type SignUpValues } from "../sign-up/model/validation";
import { getAuthenticationError, type AuthenticationError } from "../sign-in/model/authenticationError";
import { getRegistrationError, type RegistrationError } from "../sign-up/model/registrationError";
import { deleteSession, writeSession } from "./session";

export async function signInAction(values: SignInValues): Promise<{ error?: AuthenticationError }> {
  const client = createBackendClient();
  try {
    if (Object.keys(validateSignIn(values)).length) return { error: "invalidCredentials" };
    const { data } = await client.mutate<SignInMutationData>({ mutation: signInMutation, variables: { auth: values } });
    if (!data?.login) throw new Error("Missing login response");
    await writeSession({ accessToken: data.login.access_token, refreshToken: data.login.refresh_token });
    return {};
  } catch (error) {
    return { error: getAuthenticationError(error) };
  } finally {
    client.stop();
  }
}

export async function signUpAction(values: SignUpValues): Promise<{ error?: RegistrationError }> {
  const origin = (await headers()).get("origin");
  if (!origin) return { error: "server" };
  const client = createBackendClient({ origin });
  try {
    if (Object.keys(validateSignUp(values)).length) return { error: "server" };
    const { data } = await client.mutate<SignUpMutationData>({ mutation: signUpMutation, variables: { auth: values } });
    if (!data?.signup) throw new Error("Missing signup response");
    await writeSession({ accessToken: data.signup.access_token, refreshToken: data.signup.refresh_token });
    return {};
  } catch (error) {
    return { error: getRegistrationError(error) };
  } finally {
    client.stop();
  }
}

export async function signOutAction(): Promise<void> {
  await deleteSession();
}
