import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { currentAccountQuery } from "@/entities/employee";
import { profileLanguagesQuery } from "@/entities/language";

import { LanguagesPage } from "./LanguagesPage";

const accountRequest = { query: currentAccountQuery };
const accountResult = { data: { me: {
  id: "signed-in-user", avatar: null, email: "user@example.com", first_name: "Test", last_name: "User",
} } };
const languagesMock = {
  request: { query: profileLanguagesQuery, variables: { userId: "signed-in-user" } },
  result: { data: {
    profile: { id: "signed-in-user", languages: [{ name: "English", proficiency: "C1" }] },
  } },
};

describe("LanguagesPage", () => {
  it("renders hydrated assigned items immediately and keeps editing interactive", async () => {
    const cache = new InMemoryCache();
    cache.writeQuery({ ...accountRequest, data: accountResult.data });
    cache.writeQuery({ ...languagesMock.request, data: languagesMock.result.data });
    render(<MockedProvider cache={cache} mocks={[]}><LanguagesPage /></MockedProvider>);
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Loading languages" })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "REMOVE LANGUAGES" }));
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeInTheDocument();
  });

  it("loads the signed-in user's editable languages with a single Languages breadcrumb", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request: accountRequest, delay: 30, result: accountResult }, languagesMock,
    ]}><LanguagesPage /></MockedProvider>);

    expect(screen.getByRole("status", { name: "Loading languages" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ADD LANGUAGE" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "breadcrumb" })).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Languages")).toHaveAttribute("aria-current", "page");
    expect(await screen.findByText("English")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD LANGUAGE" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "REMOVE LANGUAGES" }));
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("withholds language management after an account error and supports retry", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request: accountRequest, error: new Error("Unavailable") },
      { request: accountRequest, result: accountResult }, languagesMock,
    ]}><LanguagesPage /></MockedProvider>);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load your account");
    expect(screen.queryByRole("button", { name: "ADD LANGUAGE" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry account" }));
    expect(await screen.findByText("English")).toBeInTheDocument();
  });

  it("keeps adding available when the signed-in user has no languages", async () => {
    render(<MockedProvider mocks={[
      { request: accountRequest, result: accountResult },
      { ...languagesMock, result: { data: { profile: { id: "signed-in-user", languages: [] } } } },
    ]}><LanguagesPage /></MockedProvider>);

    expect(await screen.findByText("No languages added yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD LANGUAGE" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "REMOVE LANGUAGES" })).toBeDisabled();
  });
});
