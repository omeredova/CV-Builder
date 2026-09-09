import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { profileLanguagesQuery, type ProfileLanguagesQueryData } from "@/entities/language";

import { UserLanguages } from "./UserLanguages";

const request = { query: profileLanguagesQuery, variables: { userId: "employee-2" } };
const data: ProfileLanguagesQueryData = {
  profile: { id: "employee-2", languages: [
    { name: "Russian", proficiency: "Native" },
    { name: "English", proficiency: "B2" },
  ] },
};

describe("UserLanguages", () => {
  it("loads assigned languages with accessible proficiency and no editing controls", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[{ request, delay: 40, result: { data } }]}><UserLanguages userId="employee-2" /></MockedProvider>);
    expect(screen.getByRole("status", { name: "Loading languages" })).toBeInTheDocument();
    await screen.findByText("Russian");
    expect(screen.getByRole("region", { name: "Current languages" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("progressbar", { name: "Russian proficiency" })).toHaveAttribute("aria-valuetext", "Native");
    expect(screen.getByRole("progressbar", { name: "English proficiency" })).toHaveAttribute("aria-valuetext", "B2");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await user.click(screen.getByText("English"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows caller actions only after a successful load, including an empty profile", async () => {
    render(<MockedProvider mocks={[{ request, delay: 40, result: { data: { profile: { id: "employee-2", languages: [] } } } }]}>
      <UserLanguages userId="employee-2" actions={<button type="button">Custom action</button>} />
    </MockedProvider>);
    expect(screen.queryByRole("button", { name: "Custom action" })).not.toBeInTheDocument();
    expect(await screen.findByText("No languages added yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom action" })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Current languages" })).not.toBeInTheDocument();
  });

  it.each(["network", "graphql", "missing"])("offers retry after a %s failure", async (failure) => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request, ...(failure === "network" ? { error: new Error("Offline") } : failure === "graphql" ? { result: { errors: [{ message: "Failed" }] } } : { result: { data: { profile: null } } }) },
      { request, result: { data } },
    ]}><UserLanguages userId="employee-2" actions={<button type="button">Custom action</button>} /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load languages");
    expect(screen.queryByRole("button", { name: "Custom action" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry languages" }));
    expect(await screen.findByText("English")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not retain the previous user's languages when the user changes", async () => {
    const { rerender } = render(<MockedProvider mocks={[
      { request, result: { data } },
      { request: { ...request, variables: { userId: "employee-3" } }, delay: 40, result: { data: { profile: { id: "employee-3", languages: [] } } } },
    ]}><UserLanguages userId="employee-2" /></MockedProvider>);
    await screen.findByText("Russian");
    rerender(<MockedProvider><UserLanguages userId="employee-3" /></MockedProvider>);
    expect(screen.queryByText("Russian")).not.toBeInTheDocument();
    expect(await screen.findByText("No languages added yet")).toBeInTheDocument();
  });
});
