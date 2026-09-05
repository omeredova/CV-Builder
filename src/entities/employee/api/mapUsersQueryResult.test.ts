import { describe, expect, it } from "vitest";

import { mapUsersQueryResult } from "./mapUsersQueryResult";

describe("mapUsersQueryResult", () => {
  it("normalizes users and pagination metadata", () => {
    expect(
      mapUsersQueryResult({
        items: [
          {
            department: { id: "d1", name: "Engineering" },
            email: "ada@example.com",
            id: "employee-1",
            position: null,
            profile: {
              avatar: "https://example.com/avatar.png",
              first_name: "Ada",
              last_name: "Lovelace",
            },
          },
        ],
        limit: 10,
        page: 2,
        total: 21,
        total_pages: 3,
      }),
    ).toEqual({
      employees: [
        {
          avatar: "https://example.com/avatar.png",
          department: "Engineering",
          departmentId: "d1",
          positionId: null,
          email: "ada@example.com",
          firstName: "Ada",
          id: "employee-1",
          lastName: "Lovelace",
          position: null,
        },
      ],
      limit: 10,
      page: 2,
      total: 21,
      totalPages: 3,
    });
  });
});
