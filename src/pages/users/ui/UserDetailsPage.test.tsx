import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { employeeQuery, currentProfileQuery } from "@/entities/employee";

import { UserDetailsPage } from "./UserDetailsPage";

vi.mock("next/navigation", () => ({
  usePathname: () => window.location.pathname === "/" ? "/users" : window.location.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => { window.history.replaceState(null, "", "/"); sessionStorage.clear(); });

describe("UserDetailsPage", () => {
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
    ]}><UserDetailsPage userId="direct-user" initialTab="languages" /></MockedProvider>);
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
    ]}><UserDetailsPage userId="missing" /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load profile");
    await user.click(screen.getByRole("button", { name: "Retry profile" }));
    expect(await screen.findByText("Employee not found")).toBeInTheDocument();
  });

});
