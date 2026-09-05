import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { employeesQuery, employeeQuery, currentProfileQuery, userCreatedAtQuery } from "@/entities/employee";

import { UsersPage } from "./UsersPage";

vi.mock("next/navigation", () => ({
  usePathname: () => window.location.pathname === "/" ? "/users" : window.location.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => { window.history.replaceState(null, "", "/"); sessionStorage.clear(); });

describe("UsersPage", () => {
  it("loads a direct profile URL from the server and preserves its tab", async () => {
    window.history.replaceState(null, "", "/users/direct-user/languages");
    sessionStorage.setItem("cv-builder:user-profile:direct-user", JSON.stringify({ id: "direct-user", firstName: "Stale" }));
    const cache = new InMemoryCache();
    cache.writeQuery({ query: employeeQuery, variables: { id: "direct-user" }, data: { user: {
      __typename: "User", id: "direct-user", email: "old@example.com", profile: { avatar: null, first_name: "Cached", last_name: "User" }, department: null, position: null,
    } } });
    render(<MockedProvider cache={cache} mocks={[
      { request: { query: employeeQuery, variables: { id: "direct-user" } }, result: { data: { user: {
        __typename: "User", id: "direct-user", email: "fresh@example.com", profile: { avatar: null, first_name: "Fresh", last_name: "User" },
        department: null, position: null,
      } } } },
      { request: { query: currentProfileQuery }, result: { data: { me: { id: "viewer" } } } },
    ]}><UsersPage /></MockedProvider>);
    expect(screen.getByRole("status", { name: "Loading profile" })).toBeInTheDocument();
    expect(await screen.findByText("Fresh User")).toBeInTheDocument();
    expect(screen.queryByText("Cached User")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Languages" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Languages" })).toBeInTheDocument();
  });

  it("allows retrying a failed direct profile request and handles a missing user", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/users/missing/profile");
    const request = { query: employeeQuery, variables: { id: "missing" } };
    render(<MockedProvider mocks={[
      { request, error: new Error("Offline") },
      { request, result: { data: { user: null } } },
    ]}><UsersPage /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load profile");
    await user.click(screen.getByRole("button", { name: "Retry profile" }));
    expect(await screen.findByText("Employee not found")).toBeInTheDocument();
  });

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
