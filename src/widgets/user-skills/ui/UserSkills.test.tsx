import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { profileSkillsQuery, type ProfileSkillsQueryData } from "@/entities/skill";

import { UserSkills } from "./UserSkills";

const request = { query: profileSkillsQuery, variables: { userId: "employee-2" } };
const data: ProfileSkillsQueryData = {
  profile: { id: "employee-2", skills: [
    { name: "React", categoryId: "frontend", mastery: "Expert" },
    { name: "TypeScript", categoryId: "languages", mastery: "Proficient" },
    { name: "SQL", categoryId: null, mastery: "Advanced" },
    { name: "Storybook", categoryId: "frontend", mastery: "Novice" },
    { name: "Node.js", categoryId: "backend", mastery: "Competent" },
  ] },
  skillCategories: [
    { id: "frontend", name: "Frontend", order: 2, children: [] },
    { id: "languages", name: "Programming Languages", order: 1, children: [] },
    { id: "unused", name: "Unused category", order: 3, children: [] },
    { id: "backend-parent", name: "Backend", order: 4, children: [{ id: "backend", name: "Backend technologies", order: 1 }] },
  ],
};

describe("UserSkills", () => {
  it("renders caller-supplied actions after loading", async () => {
    render(<MockedProvider mocks={[{ request, delay: 40, result: { data } }]}>
      <UserSkills userId="employee-2" actions={<button type="button">Custom action</button>} />
    </MockedProvider>);
    expect(screen.queryByRole("button", { name: "Custom action" })).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Custom action" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ADD SKILL" })).not.toBeInTheDocument();
  });

  it("loads assigned skills, groups nonempty categories, and exposes read-only mastery", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[{ request, delay: 40, result: { data } }]}><UserSkills userId="employee-2" /></MockedProvider>);
    expect(screen.getByRole("status", { name: "Loading skills" })).toBeInTheDocument();
    await screen.findByText("React");
    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual(["Programming Languages", "Frontend", "Backend", "Other skills"]);
    expect(within(screen.getByRole("region", { name: "Frontend" })).getAllByRole("listitem")).toHaveLength(2);
    for (const [name, level, mastery] of [["Storybook", 1, "Beginner"], ["SQL", 2, "Elementary"], ["Node.js", 3, "Intermediate"], ["TypeScript", 4, "Advanced"], ["React", 5, "Expert"]]) {
      const progress = screen.getByRole("progressbar", { name: `${name} mastery` });
      expect(progress).toHaveAttribute("aria-valuenow", String(level));
      expect(progress).toHaveAttribute("aria-valuetext", `${mastery}, level ${level} of 5`);
    }
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(screen.getByText("React"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each(["network", "graphql"])("offers retry after a %s error", async (failure) => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request, ...(failure === "network" ? { error: new Error("Offline") } : { result: { errors: [{ message: "Failed" }] } }) },
      { request, result: { data } },
    ]}><UserSkills userId="employee-2" /></MockedProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load skills");
    await user.click(screen.getByRole("button", { name: "Retry skills" }));
    expect(await screen.findByText("React")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an empty state even when categories exist", async () => {
    render(<MockedProvider mocks={[{ request, result: { data: { ...data, profile: { id: "employee-2", skills: [] } } } }]}><UserSkills userId="employee-2" /></MockedProvider>);
    expect(await screen.findByRole("heading", { name: "No skills added yet" })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("does not show the previous user's skills when the user changes", async () => {
    const { rerender } = render(<MockedProvider mocks={[
      { request, result: { data } },
      { request: { ...request, variables: { userId: "employee-3" } }, delay: 40, result: { data: { ...data, profile: { id: "employee-3", skills: [] } } } },
    ]}><UserSkills userId="employee-2" /></MockedProvider>);
    await screen.findByText("React");
    rerender(<MockedProvider><UserSkills userId="employee-3" /></MockedProvider>);
    expect(screen.queryByText("React")).not.toBeInTheDocument();
    expect(await screen.findByText("No skills added yet")).toBeInTheDocument();
  });
});
