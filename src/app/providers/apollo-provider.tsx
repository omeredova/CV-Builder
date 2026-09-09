"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import type { ReactNode } from "react";

import { ApiLoader } from "@/shared/api/api-loader";
import { makeClient } from "./apollo/apolloClient";

export function ApolloProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
      <ApiLoader />
    </ApolloNextAppProvider>
  );
}
