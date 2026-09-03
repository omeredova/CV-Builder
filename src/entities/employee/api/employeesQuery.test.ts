import { describe, expect, it } from "vitest";

import { createUsersQueryVariables } from "./employeesQuery";

describe("createUsersQueryVariables", () => {
  it("maps employee filters to the backend input", () => {
    expect(
      createUsersQueryVariables({
        limit: 10,
        page: 2,
        search: "  Ada  ",
        sortBy: "first_name",
        sortOrder: "desc",
      }),
    ).toEqual({
      params: {
        limit: 10,
        page: 2,
        search: "Ada",
        sort_by: "first_name",
        sort_order: "desc",
      },
    });
  });

  it("omits an empty search value", () => {
    expect(createUsersQueryVariables({ limit: 10, page: 1, search: "  " })).toEqual({
      params: { limit: 10, page: 1 },
    });
  });
});
