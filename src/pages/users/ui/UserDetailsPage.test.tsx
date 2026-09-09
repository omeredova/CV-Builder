import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider, createQueryPreloader } from "@apollo/client/react";
import { Observable } from "@apollo/client/utilities";
import { Suspense } from "react";
import { profileLanguagesQuery } from "@/entities/language";
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
  it.each(["pending", "failed"])("shows a missing employee before reading a %s tab", (state) => {
    const cache = new InMemoryCache();
    cache.writeQuery({ query: employeeQuery, variables: { id: "missing" }, data: { user: null } });
    const client = new ApolloClient({ cache, link: new ApolloLink(() => new Observable((observer) => {
      if (state === "failed") observer.error(new Error("Tab unavailable"));
    })) });
    const tabQueryRef = createQueryPreloader(client)(profileLanguagesQuery, { variables: { userId: "missing" } });
    try {
      render(<ApolloProvider client={client}><Suspense fallback={<p>Waiting for tab</p>}>
        <UserDetailsPage userId="missing" initialTab="languages" tabQueryRef={tabQueryRef} />
      </Suspense></ApolloProvider>);
      expect(screen.getByText("Employee not found")).toBeInTheDocument();
      expect(screen.queryByText("Waiting for tab")).not.toBeInTheDocument();
    } finally { client.stop(); }
  });

  it("waits for the selected tab when the employee exists", () => {
    const cache = new InMemoryCache();
    cache.writeQuery({ query: employeeQuery, variables: { id: "employee" }, data: { user: {
      __typename: "User", id: "employee", email: "user@example.test", profile: { avatar: null, first_name: "Test", last_name: "Employee" }, department: null, position: null,
    } } });
    const client = new ApolloClient({ cache, link: new ApolloLink(() => new Observable(() => undefined)) });
    const tabQueryRef = createQueryPreloader(client)(profileLanguagesQuery, { variables: { userId: "employee" } });
    try {
      render(<ApolloProvider client={client}><Suspense fallback={<p>Waiting for tab</p>}>
        <UserDetailsPage userId="employee" initialTab="languages" tabQueryRef={tabQueryRef} />
      </Suspense></ApolloProvider>);
      expect(screen.getByText("Waiting for tab")).toBeInTheDocument();
      expect(screen.queryByText("Employee not found")).not.toBeInTheDocument();
    } finally { client.stop(); }
  });

  it("renders the prefetched profile immediately and preserves its tab", async () => {
    window.history.replaceState(null, "", "/users/direct-user/languages");
    sessionStorage.setItem("cv-builder:user-profile:direct-user", JSON.stringify({ id: "direct-user", firstName: "Stale" }));
    const cache = new InMemoryCache();
    cache.writeQuery({ query: employeeQuery, variables: { id: "direct-user" }, data: { user: {
      __typename: "User", id: "direct-user", email: "fresh@example.com", profile: { avatar: null, first_name: "Fresh", last_name: "User" }, department: null, position: null,
    } } });
    render(<MockedProvider cache={cache} mocks={[
      { request: { query: currentProfileQuery }, result: { data: { me: { id: "viewer" } } } },
    ]}><UserDetailsPage userId="direct-user" initialTab="languages" /></MockedProvider>);
    expect(screen.queryByRole("status", { name: "Loading profile" })).not.toBeInTheDocument();
    expect(screen.getByText("Fresh User")).toBeInTheDocument();
    expect(screen.queryByText("Stale")).not.toBeInTheDocument();
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
