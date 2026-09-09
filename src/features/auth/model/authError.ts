export const AUTH_SERVER_ERROR_MESSAGE = "Something went wrong. Please try again later";

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}
