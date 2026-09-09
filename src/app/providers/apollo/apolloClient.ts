import { ApolloLink, HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";

import { authenticationErrorLink } from "./authenticationErrorLink";
import { requestLoadingLink } from "./requestLoadingLink";

export function makeClient(): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      requestLoadingLink,
      authenticationErrorLink,
      new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
    ]),
  });
}
