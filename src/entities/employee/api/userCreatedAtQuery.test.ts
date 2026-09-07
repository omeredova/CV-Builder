import { InMemoryCache } from "@apollo/client";
import { buildSchema, executeSync, print } from "graphql";
import { describe, expect, it } from "vitest";

import { employeeQuery } from "./employeeQuery";
import { userCreatedAtQuery } from "./userCreatedAtQuery";

describe("userCreatedAtQuery", () => {
  it("requests the membership date for the selected user", () => {
    expect(print(userCreatedAtQuery)).toContain("user(userId: $id)");
    expect(print(userCreatedAtQuery)).toContain("created_at");
  });

  it("preserves the cached Employee query when the membership date arrives", () => {
    const cache = new InMemoryCache();
    const variables = { id: "current-user" };
    const employeeData = { user: {
      __typename: "User", id: variables.id, email: "test@example.com",
      profile: { __typename: "Profile", avatar: null, first_name: "Test", last_name: "User" },
      department: null, position: null,
    } };
    cache.writeQuery({ query: employeeQuery, variables, data: employeeData });
    const response = executeSync({
      schema: buildSchema(`
        type User { id: ID!, created_at: String! }
        type Query { user(userId: ID!): User }
      `),
      document: cache.transformDocument(userCreatedAtQuery),
      variableValues: variables,
      rootValue: { user: { id: variables.id, created_at: "1705233600" } },
    });
    expect(response.errors).toBeUndefined();
    cache.writeQuery({ query: userCreatedAtQuery, variables, data: response.data });

    expect(cache.readQuery({ query: employeeQuery, variables })).toEqual(employeeData);
    expect(cache.readQuery({ query: userCreatedAtQuery, variables })).toMatchObject({
      user: { created_at: "1705233600" },
    });
  });
});
