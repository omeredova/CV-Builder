import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { employeesQuery, userCreatedAtQuery } from "@/entities/employee";

import { UsersPage } from "./UsersPage";

vi.mock("next/navigation", () => ({
  usePathname: () => "/users",
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => window.history.replaceState(null, "", "/"));

describe("UsersPage", () => {
  it("opens the selected table employee in USER PROFILE", async () => {
    const user = userEvent.setup();

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
                      department: { name: "React" },
                      email: "ada@example.com",
                      id: "employee-1",
                      position: { name: "Engineer" },
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
          {
            request: { query: userCreatedAtQuery, variables: { id: "employee-1" } },
            result: { data: { user: { created_at: 1_705_233_600 } } },
          },
        ]}
      >
        <UsersPage />
      </MockedProvider>,
    );

    await user.click(await screen.findByRole("button", { name: "Open Ada Lovelace profile" }));

    expect(window.location.pathname).toBe("/users/employee-1/profile");
    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("Profile", { selector: "[aria-current='page']" })).toBeInTheDocument();
    expect(await screen.findByText("A member since Sun Jan 14 2024")).toBeInTheDocument();
  });
});
