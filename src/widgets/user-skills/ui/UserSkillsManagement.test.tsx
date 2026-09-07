import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { profileSkillsQuery, type AssignedSkill } from "@/entities/skill";
import { addProfileSkillMutation, availableSkillsQuery, removeProfileSkillsMutation, updateProfileSkillMutation } from "@/features/skills-management";
import { UserSkills } from "./UserSkills";

const categories = [{ id: "frontend", name: "Frontend", order: 1, parent: null, children: [] }];
const react: AssignedSkill = { name: "React", categoryId: "frontend", mastery: "Expert" };
const css: AssignedSkill = { name: "CSS", categoryId: "frontend", mastery: "Novice" };

async function selectOption(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("Profile skills integration", () => {
  it("loads catalog pages on demand, reuses cached pages, and updates groups after mutations", async () => {
    const user = userEvent.setup();
    const profile = (skills: readonly AssignedSkill[]) => ({ __typename: "Profile", id: "owner", skills });
    const updated = { ...css, mastery: "Expert" as const };
    const firstPage = vi.fn(() => ({ data: { skills: { items: [{ id: "react", name: "React", category: { id: "frontend" } }], total_pages: 2 } } }));
    const secondPage = vi.fn(() => ({ data: { skills: { items: [{ id: "css", name: "CSS", category: { id: "frontend" } }], total_pages: 2 } } }));
    render(<MockedProvider mocks={[
      { request: { query: profileSkillsQuery, variables: { userId: "owner" } }, result: { data: { profile: profile([react]), skillCategories: categories } } },
      { request: { query: availableSkillsQuery, variables: { page: 1 } }, result: firstPage },
      { request: { query: availableSkillsQuery, variables: { page: 2 } }, result: secondPage },
      { request: { query: addProfileSkillMutation, variables: { skill: { userId: "owner", ...css } } }, result: { data: { profile: profile([react, css]) } } },
      { request: { query: updateProfileSkillMutation, variables: { skill: { userId: "owner", ...updated } } }, result: { data: { profile: profile([react, updated]) } } },
      { request: { query: removeProfileSkillsMutation, variables: { skill: { userId: "owner", name: ["React", "CSS"] } } }, result: { data: { profile: profile([]) } } },
    ]}><UserSkills userId="owner" canEdit /></MockedProvider>);
    await user.click(await screen.findByRole("button", { name: "ADD SKILL" }));
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    await screen.findByText("No available options on this page.");
    expect(firstPage).toHaveBeenCalledTimes(1);
    expect(secondPage).not.toHaveBeenCalled();
    expect(screen.queryByRole("option", { name: "React" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Load more options" }));
    await user.click(await screen.findByRole("option", { name: "CSS" }));
    await user.click(screen.getByRole("button", { name: "CANCEL" }));
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    await screen.findByText("No available options on this page.");
    await user.click(screen.getByRole("button", { name: "Load more options" }));
    await user.click(await screen.findByRole("option", { name: "CSS" }));
    expect(firstPage).toHaveBeenCalledTimes(1);
    expect(secondPage).toHaveBeenCalledTimes(1);
    await selectOption(user, "Skill mastery", "Beginner");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    await user.click(await screen.findByRole("button", { name: "Update CSS" }));
    await selectOption(user, "Skill mastery", "Expert");
    await user.click(screen.getByRole("button", { name: "SAVE" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("progressbar", { name: "CSS mastery" })).toHaveAttribute("aria-valuenow", "5");
    await user.click(screen.getByRole("button", { name: "REMOVE SKILLS" }));
    await user.click(screen.getByRole("button", { name: "Select React" }));
    await user.click(screen.getByRole("button", { name: "Select CSS" }));
    await user.click(screen.getByRole("button", { name: "DELETE (2)" }));
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(await screen.findByText("No skills added yet")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Frontend" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REMOVE SKILLS" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    expect(await screen.findByRole("option", { name: "React" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "CSS" })).not.toBeInTheDocument();
    await user.keyboard("{End}");
    expect(await screen.findByRole("option", { name: "CSS" })).toBeInTheDocument();
    expect(firstPage).toHaveBeenCalledTimes(1);
    expect(secondPage).toHaveBeenCalledTimes(1);
  });
});
