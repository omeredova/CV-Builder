import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type AssignedSkill } from "@/entities/skill";

import type { SkillManagementOperations } from "../model/types";
import { SkillsManagement } from "./SkillsManagement";

const categories = [{ id: "frontend", name: "Frontend", order: 1 }];
const react: AssignedSkill = { name: "React", categoryId: "frontend", mastery: "Expert" };
const css: AssignedSkill = { name: "CSS", categoryId: "frontend", mastery: "Novice" };
const catalog = [
  { id: "react", name: "React", categoryId: "frontend" },
  { id: "css", name: "CSS", categoryId: "frontend" },
];

function createOperations(): SkillManagementOperations {
  return {
    loadSkills: vi.fn().mockResolvedValue({ items: catalog, nextPage: null }),
    addSkill: vi.fn().mockResolvedValue(undefined),
    updateSkill: vi.fn().mockResolvedValue(undefined),
    removeSkills: vi.fn().mockResolvedValue(undefined),
  };
}

async function selectOption(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("SkillsManagement", () => {
  it("appends pages on scroll, deduplicates requests and options, and retries a failed page", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    const tailwind = { id: "tailwind", name: "Tailwind", categoryId: "frontend" };
    operations.loadSkills = vi.fn()
      .mockResolvedValueOnce({ items: [catalog[1]], nextPage: 2 })
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({ items: [catalog[1], tailwind, catalog[0]], nextPage: null });
    render(<SkillsManagement skills={[react]} categories={categories} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    await screen.findByRole("option", { name: "CSS" });
    expect(operations.loadSkills).toHaveBeenCalledExactlyOnceWith(1);
    const list = screen.getByRole("listbox");
    Object.defineProperties(list, {
      scrollHeight: { configurable: true, value: 200 },
      clientHeight: { configurable: true, value: 100 },
      scrollTop: { configurable: true, value: 100 },
    });
    fireEvent.scroll(list);
    fireEvent.scroll(list);
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load available skills");
    expect(screen.getByRole("option", { name: "CSS" })).toBeInTheDocument();
    expect(operations.loadSkills).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("button", { name: "Retry loading options" }));
    await screen.findByRole("option", { name: "Tailwind" });
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.queryByRole("option", { name: "React" })).not.toBeInTheDocument();
    expect(operations.loadSkills).toHaveBeenNthCalledWith(2, 2);
    expect(operations.loadSkills).toHaveBeenNthCalledWith(3, 2);
    fireEvent.scroll(list);
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    expect(screen.getByRole("option", { name: "Tailwind" })).toBeInTheDocument();
    expect(operations.loadSkills).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole("button", { name: "Load more options" })).not.toBeInTheDocument();
  });

  it("requires both fields, excludes assigned skills, maps mastery, and adds successfully", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    render(<SkillsManagement skills={[react]} categories={categories} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    expect(screen.getByRole("button", { name: "ADD" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    await screen.findByRole("option", { name: "CSS" });
    expect(screen.queryByRole("option", { name: "React" })).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.tab();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.tab();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ADD" }));
    expect(screen.getByText("Skill is required")).toBeInTheDocument();
    expect(screen.getByText("Skill mastery is required")).toBeInTheDocument();
    expect(operations.addSkill).not.toHaveBeenCalled();
    await selectOption(user, "Skill", "CSS");
    expect(operations.loadSkills).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Skill is required")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ADD" }));
    expect(operations.addSkill).not.toHaveBeenCalled();
    await selectOption(user, "Skill mastery", "Elementary");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ADD" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(operations.addSkill).toHaveBeenCalledWith({ ...css, mastery: "Advanced" });
  });

  it("preserves values on add failure and allows retry", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.addSkill = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
    render(<SkillsManagement skills={[]} categories={categories} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    await selectOption(user, "Skill", "React");
    await selectOption(user, "Skill mastery", "Expert");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to add skill");
    expect(screen.getByRole("combobox", { name: "Skill" })).toHaveTextContent("React");
    expect(screen.getByRole("combobox", { name: "Skill mastery" })).toHaveTextContent("Expert");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(operations.addSkill).toHaveBeenCalledTimes(2);
  });

  it("retries catalog errors and handles an exhausted catalog", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.loadSkills = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue({ items: catalog, nextPage: null });
    render(<SkillsManagement skills={[react, css]} categories={categories} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "ADD SKILL" }));
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load available skills");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    expect(await screen.findByText("No options available")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("combobox", { name: "Skill" }));
    expect(screen.getByText("No options available")).toBeInTheDocument();
    expect(operations.loadSkills).toHaveBeenCalledTimes(2);
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    expect(screen.getByText("Skill is required")).toBeInTheDocument();
    expect(operations.addSkill).not.toHaveBeenCalled();
  });

  it("locks the skill during updates, preserves mastery after failure, and retries", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.updateSkill = vi.fn().mockRejectedValueOnce(new Error("Failed")).mockResolvedValue(undefined);
    render(<SkillsManagement skills={[react]} categories={categories} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "Update React" }));
    expect(screen.getByRole("combobox", { name: "Skill" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Skill mastery" })).toHaveTextContent("Expert");
    await selectOption(user, "Skill mastery", "Advanced");
    await user.click(screen.getByRole("button", { name: "SAVE" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to update skill");
    expect(screen.getByRole("combobox", { name: "Skill mastery" })).toHaveTextContent("Advanced");
    await user.click(screen.getByRole("button", { name: "SAVE" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(operations.updateSkill).toHaveBeenLastCalledWith({ ...react, mastery: "Proficient" });
  });

  it("selects multiple skills, keeps selection on cancel/failure, then exits after removal", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.removeSkills = vi.fn().mockRejectedValueOnce(new Error("Failed")).mockResolvedValue(undefined);
    render(<SkillsManagement skills={[react, css]} categories={categories} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "REMOVE SKILLS" }));
    expect(screen.getByRole("button", { name: "DELETE (0)" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Select React" }));
    expect(screen.getByRole("progressbar", { name: "React mastery" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("progressbar", { name: "React mastery" })).toHaveClass("bg-skill-zero");
    expect(screen.getByRole("progressbar", { name: "CSS mastery" })).toHaveAttribute("aria-valuenow", "1");
    await user.click(screen.getByRole("button", { name: "Select CSS" }));
    expect(screen.getByRole("progressbar", { name: "CSS mastery" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("button", { name: "Select React" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "DELETE (2)" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription("Are you sure you want to remove 2 skills?");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "CANCEL" }));
    expect(operations.removeSkills).not.toHaveBeenCalled();
    expect(screen.getByRole("progressbar", { name: "React mastery" })).toHaveAttribute("aria-valuenow", "0");
    await user.click(screen.getByRole("button", { name: "DELETE (2)" }));
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to remove skills");
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(operations.removeSkills).toHaveBeenLastCalledWith(["React", "CSS"]);
    expect(screen.getByRole("button", { name: "ADD SKILL" })).toBeInTheDocument();
  });

  it("supports keyboard selection and cancels without mutations", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    render(<SkillsManagement skills={[react]} categories={categories} operations={operations} />);
    screen.getByRole("button", { name: "Update React" }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Update React" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "REMOVE SKILLS" }));
    screen.getByRole("button", { name: "Select React" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "DELETE (1)" })).toBeEnabled();
    expect(screen.getByRole("progressbar", { name: "React mastery" })).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "DELETE (0)" })).toBeDisabled();
    expect(screen.getByRole("progressbar", { name: "React mastery" })).toHaveAttribute("aria-valuenow", "5");
    await user.keyboard(" ");
    await user.click(screen.getByRole("button", { name: "CANCEL" }));
    expect(screen.getByRole("progressbar", { name: "React mastery" })).toHaveAttribute("aria-valuenow", "5");
    expect(operations.updateSkill).not.toHaveBeenCalled();
    expect(operations.removeSkills).not.toHaveBeenCalled();
  });

  it("prevents duplicate submissions while pending", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.updateSkill = vi.fn(() => new Promise<void>(() => undefined));
    render(<SkillsManagement skills={[react]} categories={categories} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "Update React" }));
    await user.dblClick(screen.getByRole("button", { name: "SAVE" }));
    expect(operations.updateSkill).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "SAVING…" })).toBeDisabled();
  });
});
