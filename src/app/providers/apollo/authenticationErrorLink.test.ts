import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  gql,
  InMemoryCache,
  ServerError,
} from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import { describe, expect, it, vi } from "vitest";

import { verifyMailMutation } from "@/features/auth/email-verification/api/verifyMailMutation";
import { sendVerificationMutation } from "@/features/auth/email-verification/api/sendVerificationMutation";

import { createAuthenticationErrorLink, isUnauthorizedError } from "./authenticationErrorLink";

const viewerQuery = gql`
  query Viewer {
    viewer
  }
`;

function createGraphqlError(code: string): CombinedGraphQLErrors {
  return new CombinedGraphQLErrors({
    errors: [{ extensions: { code }, message: "request failed" }],
  });
}

describe("isUnauthorizedError", () => {
  it("recognizes HTTP and GraphQL authentication errors", () => {
    const serverError = new ServerError("unauthorized", {
      bodyText: "",
      response: new Response(null, { status: 401 }),
    });

    expect(isUnauthorizedError(serverError)).toBe(true);
    for (const message of ["unauthorized", "Unauthorized", "jwt expired"]) {
      expect(isUnauthorizedError(new CombinedGraphQLErrors({ errors: [{ message }] }))).toBe(true);
    }
    expect(isUnauthorizedError(createGraphqlError("UNAUTHENTICATED"))).toBe(true);
    expect(isUnauthorizedError(createGraphqlError("FORBIDDEN"))).toBe(false);
  });
});

describe("authentication error link", () => {
  it("refreshes the session and retries with the new access token", async () => {
    const refreshSession = vi.fn().mockResolvedValue("new-access-token");
    const logoutSession = vi.fn();
    const requestHeaders: Array<Record<string, string>> = [];
    let requestCount = 0;
    const transportLink = new ApolloLink((operation) => {
      requestHeaders.push(operation.getContext().headers ?? {});
      requestCount += 1;

      return new Observable((observer) => {
        if (requestCount === 1) {
          observer.error(createGraphqlError("UNAUTHENTICATED"));
          return;
        }

        observer.next({ data: { viewer: "employee" } });
        observer.complete();
      });
    });
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createAuthenticationErrorLink({
          logout: logoutSession,
          refreshAccessToken: refreshSession,
        }),
        transportLink,
      ]),
    });

    await expect(client.query({ fetchPolicy: "no-cache", query: viewerQuery })).resolves.toMatchObject({
      data: { viewer: "employee" },
    });
    expect(refreshSession).toHaveBeenCalledOnce();
    expect(logoutSession).not.toHaveBeenCalled();
    expect(requestHeaders[1]).toMatchObject({ authorization: "Bearer new-access-token" });
  });

  it.each([
    { mutation: verifyMailMutation, variables: { mail: { otp: "123456" } }, field: "verifyMail" },
    { mutation: sendVerificationMutation, variables: { email: "owner@example.com" }, field: "sendVerification" },
  ])("refreshes and retries $field without changing its variables", async ({ mutation, variables, field }) => {
    const refreshSession = vi.fn().mockResolvedValue("new-access-token");
    const logoutSession = vi.fn();
    const requests: Array<{ headers: Record<string, string>; variables: unknown }> = [];
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createAuthenticationErrorLink({ logout: logoutSession, refreshAccessToken: refreshSession }),
        new ApolloLink((operation) => new Observable((observer) => {
          requests.push({ headers: operation.getContext().headers, variables: operation.variables });
          if (requests.length === 1) {
            observer.error(createGraphqlError("UNAUTHENTICATED"));
            return;
          }
          observer.next({ data: { [field]: null } });
          observer.complete();
        })),
      ]),
    });

    await expect(client.mutate({
      mutation, variables, context: { headers: { authorization: "Bearer expired-access-token" } },
    })).resolves.toMatchObject({ data: { [field]: null } });
    expect(refreshSession).toHaveBeenCalledOnce();
    expect(logoutSession).not.toHaveBeenCalled();
    expect(requests).toEqual([
      { headers: { authorization: "Bearer expired-access-token" }, variables },
      { headers: { authorization: "Bearer new-access-token" }, variables },
    ]);
  });

  it("does not refresh the session for an expired verification code", async () => {
    const refreshSession = vi.fn();
    const error = new CombinedGraphQLErrors({ errors: [{ message: "otpExpired" }] });
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createAuthenticationErrorLink({ logout: vi.fn(), refreshAccessToken: refreshSession }),
        new ApolloLink(() => new Observable((observer) => observer.error(error))),
      ]),
    });
    await expect(client.mutate({
      mutation: verifyMailMutation, variables: { mail: { otp: "123456" } },
    })).rejects.toBe(error);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("logs out and returns the original error when refresh fails", async () => {
    const authenticationError = createGraphqlError("UNAUTHENTICATED");
    const logoutSession = vi.fn();
    const transportLink = new ApolloLink(
      () => new Observable((observer) => observer.error(authenticationError)),
    );
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createAuthenticationErrorLink({
          logout: logoutSession,
          refreshAccessToken: vi.fn().mockRejectedValue(new Error("refresh failed")),
        }),
        transportLink,
      ]),
    });

    await expect(client.query({ fetchPolicy: "no-cache", query: viewerQuery })).rejects.toBe(
      authenticationError,
    );
    expect(logoutSession).toHaveBeenCalledOnce();
  });

  it("does not refresh authentication operations", async () => {
    const refreshSession = vi.fn();
    const authenticationError = createGraphqlError("UNAUTHENTICATED");
    const signInQuery = gql`
      query SignIn {
        viewer
      }
    `;
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        createAuthenticationErrorLink({
          logout: vi.fn(),
          refreshAccessToken: refreshSession,
        }),
        new ApolloLink(() => new Observable((observer) => observer.error(authenticationError))),
      ]),
    });

    await expect(client.query({ fetchPolicy: "no-cache", query: signInQuery })).rejects.toBe(
      authenticationError,
    );
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
