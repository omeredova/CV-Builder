import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export function createServerApolloClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      fetchOptions: { cache: "no-store" },
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql",
    }),
  });
}
