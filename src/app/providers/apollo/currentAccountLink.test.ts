// @vitest-environment node
import { ApolloClient, ApolloLink, gql, InMemoryCache } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import { describe, expect, it, vi } from "vitest";
import { currentAccountQuery } from "@/entities/employee";
import { createCurrentAccountLink } from "./currentAccountLink";

const account = { __typename: "Profile", id: "alice", avatar: null, email: "alice@example.test", first_name: "Alice", last_name: "Test" };

function setup(loadAccount = vi.fn(async () => account)) {
  const network = vi.fn();
  const client = new ApolloClient({ cache: new InMemoryCache(), link: createCurrentAccountLink(loadAccount).concat(
    new ApolloLink((operation) => new Observable((observer) => {
      network(operation.operationName);
      observer.next({ data: { me: { __typename: "Profile", id: "network" } } });
      observer.complete();
    })),
  ) });
  return { client, network, loadAccount };
}

describe("validated account hydration", () => {
  it("supplies the guard's account even when preloading bypasses Apollo's cache", async () => {
    const { client, network, loadAccount } = setup();
    try {
      const result = await client.query({ query: currentAccountQuery, fetchPolicy: "no-cache" });
      expect(result.data).toEqual({ me: account });
      expect(loadAccount).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
    } finally { client.stop(); }
  });
  it("does not intercept a different query with the same operation name", async () => {
    const { client, network, loadAccount } = setup();
    try {
      await client.query({ query: gql`query CurrentAccount { me { id } }` });
      expect(network).toHaveBeenCalledOnce();
      expect(loadAccount).not.toHaveBeenCalled();
    } finally { client.stop(); }
  });
  it("propagates validation failures without falling back to a second request", async () => {
    const failure = new Error("Session invalid");
    const { client, network } = setup(vi.fn().mockRejectedValue(failure));
    try {
      await expect(client.query({ query: currentAccountQuery, fetchPolicy: "no-cache" })).rejects.toBe(failure);
      expect(network).not.toHaveBeenCalled();
    } finally { client.stop(); }
  });
  it("keeps account results isolated between request clients", async () => {
    const alice = setup();
    const bob = setup(vi.fn(async () => ({ ...account, id: "bob", first_name: "Bob" })));
    try {
      const results = await Promise.all([alice.client, bob.client].map((client) => client.query({ query: currentAccountQuery, fetchPolicy: "no-cache" })));
      expect(results.map((result) => result.data)).toEqual([{ me: account }, { me: { ...account, id: "bob", first_name: "Bob" } }]);
      expect(alice.network).not.toHaveBeenCalled();
      expect(bob.network).not.toHaveBeenCalled();
    } finally { alice.client.stop(); bob.client.stop(); }
  });
});
