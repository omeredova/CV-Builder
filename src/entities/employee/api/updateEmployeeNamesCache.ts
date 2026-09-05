import type { ApolloCache, Reference, StoreObject } from "@apollo/client";

interface SavedProfileNames {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export function updateEmployeeNamesCache(cache: ApolloCache, userId: string, profile: SavedProfileNames): void {
  cache.modify({
    id: cache.identify({ __typename: "Profile", id: profile.id }),
    fields: {
      first_name: () => profile.first_name,
      last_name: () => profile.last_name,
    },
  });
  cache.modify({
    id: cache.identify({ __typename: "User", id: userId }),
    fields: {
      profile(existing: StoreObject | Reference | undefined, { isReference }) {
        return isReference(existing) ? existing : {
          ...existing,
          first_name: profile.first_name,
          last_name: profile.last_name,
        };
      },
    },
  });
}
