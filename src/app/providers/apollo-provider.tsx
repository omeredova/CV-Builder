"use client";

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { Observable } from "@apollo/client/utilities";
import type { ReactNode } from "react";

import { ApiLoader } from "@/shared/api/api-loader";
import { beginApiRequest } from "@/shared/api/request-loading-store";

const requestLoadingLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const finishRequest = beginApiRequest();

    try {
      const subscription = forward(operation).subscribe(observer);
      subscription.add(finishRequest);

      return () => subscription.unsubscribe();
    } catch (error: unknown) {
      finishRequest();
      observer.error(error);
    }
  });
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    requestLoadingLink,
    new HttpLink({
      uri: process.env.VITE_GRAPHQL_URL,
    }),
  ]),
});

export function ApolloProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <BaseApolloProvider client={client}>
      {children}
      <ApiLoader />
    </BaseApolloProvider>
  );
}
