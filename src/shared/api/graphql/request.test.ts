// @vitest-environment node
import { describe, expect, it } from "vitest";
import { print } from "graphql";
import { parseGraphqlRequest } from "./request";

describe("GraphQL request parsing", () => {
  it("selects the requested operation and its fragments", () => {
    const input = parseGraphqlRequest({ query: "query One { me { ...Identity } } query Two { users { id } } fragment Identity on Profile { id }", operationName: "One" });
    expect(print(input.document)).toContain("fragment Identity");
    expect(print(input.document)).not.toContain("query Two");
    expect(input.mutation).toBe(false);
  });
  it("accepts syntactically valid authentication operations without imposing domain policy", () => {
    expect(parseGraphqlRequest({ query: "mutation { updateToken { access_token } }" }).mutation).toBe(true);
  });
  it.each([null, { query: 1 }, { query: "query { me { id } }", variables: [] }, { query: "query One { me { id } } query Two { me { id } }" }, { query: "subscription { events }" }])("rejects unsupported requests: %j", (body) => {
    expect(() => parseGraphqlRequest(body)).toThrow();
  });
});
