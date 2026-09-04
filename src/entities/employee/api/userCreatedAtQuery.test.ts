import { print } from "graphql";
import { describe, expect, it } from "vitest";

import { userCreatedAtQuery } from "./userCreatedAtQuery";

describe("userCreatedAtQuery", () => {
  it("requests only the creation date for a user ID", () => {
    expect(print(userCreatedAtQuery)).toContain("user(userId: $id)");
    expect(print(userCreatedAtQuery)).toContain("created_at");
  });
});
