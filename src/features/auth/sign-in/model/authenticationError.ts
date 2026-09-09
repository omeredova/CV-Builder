import { getErrorMessage } from "../../model/authError";

export type AuthenticationError = "invalidCredentials" | "server";

export function getAuthenticationError(error: unknown): AuthenticationError {
  return getErrorMessage(error).includes("invalidCredentials") ? "invalidCredentials" : "server";
}
