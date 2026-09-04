import { gql, InMemoryCache } from "@apollo/client";
import { describe, expect, it } from "vitest";

import { updateEmployeeAvatarCache } from "./updateEmployeeAvatarCache";

const fragment = gql`
  fragment CachedEmployeeAvatar on User {
    id
    profile {
      id
      avatar
      first_name
    }
  }
`;

describe("updateEmployeeAvatarCache", () => {
  it("updates and clears a normalized profile without changing another employee", () => {
    const cache = new InMemoryCache();
    for (const id of ["42", "43"]) {
      cache.writeFragment({
        id: `User:${id}`,
        fragment,
        data: {
          __typename: "User",
          id,
          profile: {
            __typename: "Profile",
            id,
            avatar: "old.png",
            first_name: "Ada",
          },
        },
      });
    }
    updateEmployeeAvatarCache(cache, "42", "new.png");
    expect(cache.readFragment({ id: "User:42", fragment })).toMatchObject({
      profile: { avatar: "new.png", first_name: "Ada" },
    });
    updateEmployeeAvatarCache(cache, "42", null);
    expect(cache.readFragment({ id: "User:42", fragment })).toMatchObject({
      profile: { avatar: null, first_name: "Ada" },
    });
    expect(cache.readFragment({ id: "User:43", fragment })).toMatchObject({
      profile: { avatar: "old.png" },
    });
  });
});
