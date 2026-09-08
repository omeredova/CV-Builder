import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { employeesQuery } from "@/entities/employee";

import { UsersPage } from "./UsersPage";

vi.mock("next/navigation", () => ({
  usePathname: () => window.location.pathname === "/" ? "/users" : window.location.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => { window.history.replaceState(null, "", "/"); sessionStorage.clear(); });

describe("UsersPage", () => {
  it("links to the selected employee profile", async () => {

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: employeesQuery,
              variables: { params: { limit: 10, page: 1, sort_order: "asc" } },
            },
            result: {
              data: {
                users: {
                  items: [
                    {
                      __typename: "User",
                      department: { id: "d1", name: "React" },
                      email: "ada@example.com",
                      id: "employee-1",
                      position: { id: "p1", name: "Engineer" },
                      profile: { avatar: null, first_name: "Ada", last_name: "Lovelace" },
                    },
                  ],
                  limit: 10,
                  page: 1,
                  total: 1,
                  total_pages: 1,
                },
              },
            },
          },
        ]}
      >
        <UsersPage />
      </MockedProvider>,
    );

    expect(await screen.findByRole("link", { name: "Open Ada Lovelace profile" })).toHaveAttribute("href", "/users/employee-1/profile");
  });
});
