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
