"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  }),
});

export function ApolloProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
