import { getErrorMessage } from "../../model/authError";

export type RegistrationError = "emailExists" | "server";

export function getRegistrationError(error: unknown): RegistrationError {
  return getErrorMessage(error).includes("userAlreadyExists") ? "emailExists" : "server";
}
