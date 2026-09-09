import "server-only";

import { HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ApolloClient, InMemoryCache, registerApolloClient } from "@apollo/client-integration-nextjs";
import { readSession } from "@/features/auth/server";
import { graphqlUrl } from "@/shared/config/graphql";
import { requireDashboardSession } from "@/app/server/requireSession";
import { createCurrentAccountLink } from "./currentAccountLink";

export const { PreloadQuery } = registerApolloClient(() => new ApolloClient({
  cache: new InMemoryCache(),
  // PreloadQuery bypasses Apollo's cache, so reuse the request-scoped guard result
  // at the link instead of issuing a second CurrentAccount backend request.
  link: createCurrentAccountLink(requireDashboardSession).concat(new SetContextLink(async () => {
    const { accessToken } = await readSession();
    return { headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {} };
  }).concat(new HttpLink({ uri: graphqlUrl, fetchOptions: { cache: "no-store" } }))),
}));
