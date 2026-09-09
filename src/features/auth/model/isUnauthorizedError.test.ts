import { CombinedGraphQLErrors, ServerError } from "@apollo/client";
import { describe, expect, it } from "vitest";
import { isUnauthorizedError } from "./isUnauthorizedError";

describe("session error classification", () => {
  it("recognizes HTTP and GraphQL expiration", () => {
    expect(isUnauthorizedError(new ServerError("Unauthorized", { response: new Response(null, { status: 401 }), bodyText: "" }))).toBe(true);
    expect(isUnauthorizedError(new CombinedGraphQLErrors({ errors: [{ message: "jwt expired" }] }))).toBe(true);
  });
  it("preserves incorrect-password and permission errors as operation errors", () => {
    expect(isUnauthorizedError(new CombinedGraphQLErrors({ errors: [{ message: "oldPasswordIncorrect", extensions: { code: "UNAUTHENTICATED" } }] }))).toBe(false);
    expect(isUnauthorizedError(new CombinedGraphQLErrors({ errors: [{ message: "Forbidden", extensions: { code: "FORBIDDEN" } }] }))).toBe(false);
  });
});
