import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AssignedLanguage } from "@/entities/language";

import type { LanguageManagementOperations } from "../model/types";
import { LanguagesManagement } from "./LanguagesManagement";

const english: AssignedLanguage = { name: "English", proficiency: "B2" };
const russian: AssignedLanguage = { name: "Russian", proficiency: "Native" };
const catalog = [{ id: "en", name: "English" }, { id: "ru", name: "Russian" }];

function createOperations(): LanguageManagementOperations {
  return {
    loadLanguages: vi.fn().mockResolvedValue({ items: catalog, nextPage: null }),
    addLanguage: vi.fn().mockResolvedValue(undefined),
    updateLanguage: vi.fn().mockResolvedValue(undefined),
    removeLanguages: vi.fn().mockResolvedValue(undefined),
  };
}

async function selectOption(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("LanguagesManagement", () => {
  it("requires both fields, validates inline, excludes assigned languages, and preserves a failed add", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.addLanguage = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
    render(<LanguagesManagement languages={[russian]} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "ADD LANGUAGE" }));
    expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
    await user.click(screen.getByRole("combobox", { name: "Language" }));
    await screen.findByRole("option", { name: "English" });
    expect(screen.queryByRole("option", { name: "Russian" })).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.tab();
    expect(screen.getByText("Language is required")).toBeInTheDocument();
    await user.tab();
    expect(screen.getByText("Language proficiency is required")).toBeInTheDocument();
    await selectOption(user, "Language", "English");
    expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
    await user.click(screen.getByRole("combobox", { name: "Language proficiency" }));
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["A1", "A2", "B1", "B2", "C1", "C2", "Native"]);
    await user.click(screen.getByRole("option", { name: "B2" }));
    await user.click(screen.getByRole("button", { name: "ADD" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to add language");
    expect(screen.getByRole("combobox", { name: "Language" })).toHaveTextContent("English");
    expect(screen.getByRole("combobox", { name: "Language proficiency" })).toHaveTextContent("B2");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(operations.addLanguage).toHaveBeenLastCalledWith(english);
  });

  it("locks language on update, retains failed values, and restores keyboard focus on close", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.updateLanguage = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
    render(<LanguagesManagement languages={[english]} operations={operations} />);
    screen.getByRole("button", { name: "Update English" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("combobox", { name: "Language" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Language proficiency" })).toHaveTextContent("B2");
    await selectOption(user, "Language proficiency", "C1");
    await user.click(screen.getByRole("button", { name: "SAVE" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to update language");
    expect(screen.getByRole("combobox", { name: "Language proficiency" })).toHaveTextContent("C1");
    await user.click(screen.getByRole("button", { name: "SAVE" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(operations.updateLanguage).toHaveBeenLastCalledWith({ ...english, proficiency: "C1" });
    expect(screen.getByRole("button", { name: "Update English" })).toHaveFocus();
    await user.keyboard("{Enter}{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports bulk selection, cancel, failure retry and exits selection after successful removal", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.removeLanguages = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
    render(<LanguagesManagement languages={[english, russian]} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "REMOVE LANGUAGES" }));
    expect(screen.getByRole("button", { name: "REMOVE (0)" })).toBeDisabled();
    screen.getByRole("button", { name: "Select English" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Select English" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("progressbar", { name: "English proficiency" })).toHaveClass("bg-skill-zero");
    await user.click(screen.getByRole("button", { name: "Select Russian" }));
    await user.click(screen.getByRole("button", { name: "REMOVE (2)" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription("Are you sure you want to remove 2 languages?");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "CANCEL" }));
    expect(operations.removeLanguages).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "REMOVE (2)" }));
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to remove languages");
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(operations.removeLanguages).toHaveBeenLastCalledWith(["English", "Russian"]);
    expect(screen.getByRole("button", { name: "ADD LANGUAGE" })).toBeInTheDocument();
  });

  it("retries catalog failures and handles an exhausted catalog", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.loadLanguages = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue({ items: catalog, nextPage: null });
    render(<LanguagesManagement languages={[english, russian]} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "ADD LANGUAGE" }));
    await user.click(screen.getByRole("combobox", { name: "Language" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load available languages");
    await user.click(screen.getByRole("button", { name: "Retry loading options" }));
    expect(await screen.findByText("No options available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
  });

  it("prevents duplicate submissions", async () => {
    const user = userEvent.setup();
    const operations = createOperations();
    operations.updateLanguage = vi.fn(() => new Promise<void>(() => undefined));
    render(<LanguagesManagement languages={[english]} operations={operations} />);
    await user.click(screen.getByRole("button", { name: "Update English" }));
    await user.dblClick(screen.getByRole("button", { name: "SAVE" }));
    expect(operations.updateLanguage).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "SAVING…" })).toBeDisabled();
  });
});
