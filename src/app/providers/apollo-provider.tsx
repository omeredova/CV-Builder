"use client";

import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";

import { ApiLoader } from "@/shared/api/api-loader";
import { apolloClient } from "./apollo/apolloClient";

export function ApolloProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
      <ApiLoader />
    </BaseApolloProvider>
  );
}
