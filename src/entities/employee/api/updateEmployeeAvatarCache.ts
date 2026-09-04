import type { ApolloCache, Reference, StoreObject } from "@apollo/client";

export function updateEmployeeAvatarCache(
  cache: ApolloCache,
  userId: string,
  avatar: string | null,
): void {
  cache.modify({
    id: cache.identify({ __typename: "Profile", id: userId }),
    fields: { avatar: () => avatar },
  });
  cache.modify({
    id: cache.identify({ __typename: "User", id: userId }),
    fields: {
      profile(existing: StoreObject | Reference | undefined, { isReference }) {
        return isReference(existing) ? existing : { ...existing, avatar };
      },
    },
  });
}
