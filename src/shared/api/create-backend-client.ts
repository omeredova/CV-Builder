import "server-only";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { graphqlUrl } from "@/shared/config/graphql";

/** A fresh cache and transport for each server request. */
export function createBackendClient(headers: Record<string, string> = {}): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: graphqlUrl,
      headers,
      fetchOptions: { cache: "no-store" },
    }),
  });
}
