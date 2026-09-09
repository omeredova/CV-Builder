import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import { describe, expect, it, vi } from "vitest";

import { resetPasswordMutation } from "@/features/auth/password-reset/api/resetPasswordMutation";
import { authorizationLink } from "./authorizationLink";

const { getAccessToken } = vi.hoisted(() => ({ getAccessToken: vi.fn() }));
vi.mock("@/features/auth", () => ({ getAccessToken }));

describe("authorization link", () => {
  it.each([
    {
      scenario: "preserves the password-reset token when a session exists",
      sessionToken: "session-token",
      headers: { authorization: "Bearer reset-token", "x-request-id": "reset" },
      expectedHeaders: { authorization: "Bearer reset-token", "x-request-id": "reset" },
    },
    {
      scenario: "adds the session token when authorization is not supplied",
      sessionToken: "session-token",
      headers: { "x-request-id": "session" },
      expectedHeaders: { authorization: "Bearer session-token", "x-request-id": "session" },
    },
    {
      scenario: "does not add authorization when no session exists",
      sessionToken: null,
      headers: { "x-request-id": "anonymous" },
      expectedHeaders: { "x-request-id": "anonymous" },
    },
  ])("$scenario", async ({ sessionToken, headers, expectedHeaders }) => {
    getAccessToken.mockReturnValue(sessionToken);
    const requests = vi.fn();
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        authorizationLink,
        new ApolloLink((operation) => new Observable((observer) => {
          requests(operation.getContext().headers, operation.variables);
          observer.next({ data: { resetPassword: null } });
          observer.complete();
        })),
      ]),
    });
    const variables = { auth: { newPassword: "new-password", confirmPassword: "new-password" } };

    try {
      await client.mutate({ mutation: resetPasswordMutation, variables, context: { headers } });
      expect(requests).toHaveBeenCalledExactlyOnceWith(expectedHeaders, variables);
    } finally {
      client.stop();
    }
  });
});
