import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { currentAccountQuery } from "@/entities/employee";
import { profileSkillsQuery } from "@/entities/skill";

import { SkillsPage } from "./SkillsPage";

const accountRequest = { query: currentAccountQuery };
const accountResult = { data: { me: {
  id: "signed-in-user", avatar: null, email: "user@example.com", first_name: "Test", last_name: "User",
} } };
const skillsMock = {
  request: { query: profileSkillsQuery, variables: { userId: "signed-in-user" } },
  result: { data: {
    profile: { id: "signed-in-user", skills: [{ name: "React", categoryId: "frontend", mastery: "Expert" }] },
    skillCategories: [{ id: "frontend", name: "Frontend", order: 1, parent: null, children: [] }],
  } },
};

describe("SkillsPage", () => {
  it("renders hydrated assigned items immediately and keeps editing interactive", async () => {
    const cache = new InMemoryCache();
    cache.writeQuery({ ...accountRequest, data: accountResult.data });
    cache.writeQuery({ ...skillsMock.request, data: skillsMock.result.data });
    render(<MockedProvider cache={cache} mocks={[]}><SkillsPage /></MockedProvider>);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Loading skills" })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "REMOVE SKILLS" }));
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeInTheDocument();
  });

  it("loads the signed-in user's editable skills with a single Skills breadcrumb", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request: accountRequest, delay: 30, result: accountResult }, skillsMock,
    ]}><SkillsPage /></MockedProvider>);

    expect(screen.getByRole("status", { name: "Loading skills" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ADD SKILL" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "breadcrumb" })).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Skills")).toHaveAttribute("aria-current", "page");
    expect(await screen.findByText("React")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD SKILL" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "REMOVE SKILLS" }));
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("withholds skill management after an account error and supports retry", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request: accountRequest, error: new Error("Unavailable") },
      { request: accountRequest, result: accountResult }, skillsMock,
    ]}><SkillsPage /></MockedProvider>);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load your account");
    expect(screen.queryByRole("button", { name: "ADD SKILL" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry account" }));
    expect(await screen.findByText("React")).toBeInTheDocument();
  });

  it("keeps adding available when the signed-in user has no skills", async () => {
    render(<MockedProvider mocks={[
      { request: accountRequest, result: accountResult },
      { ...skillsMock, result: { data: { profile: { id: "signed-in-user", skills: [] }, skillCategories: [] } } },
    ]}><SkillsPage /></MockedProvider>);

    expect(await screen.findByText("No skills added yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD SKILL" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "REMOVE SKILLS" })).toBeDisabled();
  });
});
