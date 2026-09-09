import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { profileSkillsQuery, skillCategoriesQuery, type AssignedSkill } from "@/entities/skill";
import { addCvSkillMutation, removeCvSkillsMutation, updateCvSkillMutation } from "@/features/skills-management";
import { InMemoryCache } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { cvSkillsQuery, type CvSkills } from "@/entities/cv";
import { CvSkillsManagement } from "./CvSkillsManagement";

function SelectedCvSkills() {
  const { data } = useQuery<{ cv: CvSkills }>(cvSkillsQuery, { variables: { cvId: "selected-cv" } });
  return data ? <CvSkillsManagement cvId={data.cv.id} ownerId="owner" skills={data.cv.skills} canEdit /> : null;
}

const categories = [{ id: "frontend", name: "Frontend", order: 1, parent: null, children: [] }];
const react: AssignedSkill = { name: "React", categoryId: "frontend", mastery: "Expert" };
const css: AssignedSkill = { name: "CSS", categoryId: "frontend", mastery: "Novice" };

async function selectOption(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("CV skills integration", () => {
  it.each([true, false])("keeps an empty CV empty until an owner skill is added (owner has skills: %s)", async (hasOwnerSkills) => {
    const user = userEvent.setup();
    const selectedCv = { __typename: "Cv", id: "selected-cv", name: "Empty CV", education: null, description: "", user: { id: "owner", email: "owner@example.com" }, skills: [], languages: [], projects: [] };
    const added = vi.fn(() => ({ data: { cv: { __typename: "Cv", id: "selected-cv", skills: [css] } } }));
    render(<MockedProvider mocks={[
      { request: { query: cvSkillsQuery, variables: { cvId: "selected-cv" } }, result: { data: { cv: selectedCv } } },
      { request: { query: skillCategoriesQuery }, result: { data: { skillCategories: categories } } },
      { request: { query: profileSkillsQuery, variables: { userId: "owner" } }, result: { data: { profile: { id: "owner", skills: hasOwnerSkills ? [css] : [] }, skillCategories: categories } } },
      { request: { query: addCvSkillMutation, variables: { skill: { cvId: "selected-cv", ...css } } }, result: added },
    ]}><SelectedCvSkills /></MockedProvider>);
    expect(await screen.findByText("No skills added yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update CSS" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    if (!hasOwnerSkills) {
      await screen.findByText("No options available");
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
      expect(added).not.toHaveBeenCalled();
      return;
    }
    await user.click(await screen.findByRole("option", { name: "CSS" }));
    await selectOption(user, "Skill mastery", "Beginner");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    expect(await screen.findByRole("button", { name: "Update CSS" })).toBeInTheDocument();
    expect(screen.queryByText("No skills added yet")).not.toBeInTheDocument();
    expect(added).toHaveBeenCalledTimes(1);
  });

  it("offers only owner skills, excludes assigned skills, and changes only the selected CV", async () => {
    const user = userEvent.setup();
    const cv = (skills: readonly AssignedSkill[]) => ({ __typename: "Cv", id: "selected-cv", skills });
    const cache = new InMemoryCache();
    cache.writeQuery({ query: cvSkillsQuery, variables: { cvId: "other-cv" }, data: { cv: { ...cv([react]), id: "other-cv", name: "Other CV", education: "University", description: "Other", user: { id: "owner", email: "owner@example.com" }, languages: [], projects: [] } } });
    const otherBefore = cache.readQuery({ query: cvSkillsQuery, variables: { cvId: "other-cv" } });
    const updated = { ...css, mastery: "Expert" as const };
    const ownerSkills = vi.fn(() => ({ data: { profile: { __typename: "Profile", id: "owner", skills: [react, css] }, skillCategories: categories } }));
    render(<MockedProvider cache={cache} mocks={[
      { request: { query: cvSkillsQuery, variables: { cvId: "selected-cv" } }, result: { data: { cv: { ...cv([react]), name: "Selected CV", education: "University", description: "Selected", user: { id: "owner", email: "owner@example.com" }, languages: [], projects: [] } } } },
      { request: { query: skillCategoriesQuery }, result: { data: { skillCategories: categories } } },
      { request: { query: profileSkillsQuery, variables: { userId: "owner" } }, result: ownerSkills },
      { request: { query: addCvSkillMutation, variables: { skill: { cvId: "selected-cv", ...css } } }, result: { data: { cv: cv([react, css]) } } },
      { request: { query: updateCvSkillMutation, variables: { skill: { cvId: "selected-cv", ...updated } } }, result: { data: { cv: cv([react, updated]) } } },
      { request: { query: removeCvSkillsMutation, variables: { skill: { cvId: "selected-cv", name: ["React", "CSS"] } } }, result: { data: { cv: cv([]) } } },
    ]}><SelectedCvSkills /></MockedProvider>);
    await user.click(await screen.findByRole("button", { name: "ADD SKILL" }));
    expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    expect(await screen.findByRole("option", { name: "CSS" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "React" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Java" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "CSS" }));
    const profileBefore = cache.readQuery({ query: profileSkillsQuery, variables: { userId: "owner" } });
    await selectOption(user, "Skill mastery", "Beginner");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    await user.click(await screen.findByRole("button", { name: "Update CSS" }));
    expect(screen.getByRole("combobox", { name: "Skill" })).toBeDisabled();
    await selectOption(user, "Skill mastery", "Expert");
    await user.click(screen.getByRole("button", { name: "SAVE" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("progressbar", { name: "CSS mastery" })).toHaveAttribute("aria-valuenow", "5");
    await user.click(screen.getByRole("button", { name: "REMOVE SKILLS" }));
    expect(screen.getByRole("button", { name: "REMOVE (0)" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Select React" }));
    await user.click(screen.getByRole("button", { name: "Select CSS" }));
    await user.click(screen.getByRole("button", { name: "REMOVE (2)" }));
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(await screen.findByText("No skills added yet")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Frontend" })).not.toBeInTheDocument();
    expect(cache.readQuery({ query: cvSkillsQuery, variables: { cvId: "other-cv" } })).toEqual(otherBefore);
    expect(screen.getByRole("button", { name: "REMOVE SKILLS" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    expect(await screen.findByRole("option", { name: "React" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "CSS" })).toBeInTheDocument();
    expect(ownerSkills).toHaveBeenCalledTimes(1);
    expect(cache.readQuery({ query: profileSkillsQuery, variables: { userId: "owner" } })).toEqual(profileBefore);
  });
});
