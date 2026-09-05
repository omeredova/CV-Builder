import { ApolloClient, ApolloLink, gql, InMemoryCache } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestLoadingLink } from "./requestLoadingLink";

const { begin, finish } = vi.hoisted(() => ({ begin: vi.fn(), finish: vi.fn() }));
vi.mock("@/shared/api/request-loading-store", () => ({ beginApiRequest: begin }));
beforeEach(() => { begin.mockReset().mockReturnValue(finish); finish.mockReset(); });

describe("requestLoadingLink", () => {
  it.each([false, true])("respects inline loading without changing request execution (skip: %s)", async (skipGlobalLoader) => {
    const transport = vi.fn(() => new Observable<{ data: { loaded: boolean } }>((observer) => {
      observer.next({ data: { loaded: true } });
      observer.complete();
    }));
    const client = new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.from([requestLoadingLink, new ApolloLink(transport)]) });
    const result = await client.query({ query: gql`query LoadingTest { loaded }`, context: { skipGlobalLoader } });
    expect(result.data).toEqual({ loaded: true });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(begin).toHaveBeenCalledTimes(skipGlobalLoader ? 0 : 1);
    expect(finish).toHaveBeenCalledTimes(skipGlobalLoader ? 0 : 1);
    client.stop();
  });
});
