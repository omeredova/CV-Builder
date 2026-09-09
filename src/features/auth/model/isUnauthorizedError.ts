import { CombinedGraphQLErrors, ServerError } from "@apollo/client";

export function isUnauthorizedError(error: unknown): boolean {
  if (ServerError.is(error)) return error.statusCode === 401;
  if (!CombinedGraphQLErrors.is(error)) return false;
  return error.errors.some((item) =>
    item.message !== "oldPasswordIncorrect" && (
      item.message.toLowerCase() === "unauthorized" ||
      item.message === "jwt expired" ||
      item.extensions?.code === "UNAUTHENTICATED"
    ),
  );
}
