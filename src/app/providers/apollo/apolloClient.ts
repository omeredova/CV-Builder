import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

import { graphqlUrl } from "@/shared/config/graphql";

import { authenticationErrorLink } from "./authenticationErrorLink";
import { authorizationLink } from "./authorizationLink";
import { requestLoadingLink } from "./requestLoadingLink";

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    requestLoadingLink,
    authenticationErrorLink,
    authorizationLink,
    new HttpLink({ uri: graphqlUrl }),
  ]),
});
