import { ApolloClient, ApolloLink, gql, InMemoryCache } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import { describe, expect, it, vi } from "vitest";
import { createAuthenticationErrorLink } from "./authenticationErrorLink";

vi.mock("@/features/auth", () => ({ logout: vi.fn() }));

describe("authentication error link", () => {
  it.each(["SESSION_EXPIRED", "UNAUTHENTICATED", "FORBIDDEN"])("handles %s without replacing operation credentials", async (code) => {
    const logout = vi.fn();
    const requests = vi.fn();
    const client = new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.from([
      createAuthenticationErrorLink(logout),
      new ApolloLink((operation) => new Observable((observer) => {
        requests(operation.getContext().headers);
        observer.next({ errors: [{ message: "Unauthorized", extensions: { code } }] });
        observer.complete();
      })),
    ]) });
    try {
      await expect(client.query({ query: gql`query Viewer { viewer }`, context: { headers: { authorization: "Bearer reset-token" } } })).rejects.toThrow();
      expect(requests).toHaveBeenCalledExactlyOnceWith({ authorization: "Bearer reset-token" });
      expect(logout).toHaveBeenCalledTimes(code === "SESSION_EXPIRED" ? 1 : 0);
    } finally { client.stop(); }
  });
});
