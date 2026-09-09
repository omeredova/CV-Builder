import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { profileLanguagesQuery, type AssignedLanguage } from "@/entities/language";
import { addProfileLanguageMutation, availableLanguagesQuery, removeProfileLanguagesMutation, updateProfileLanguageMutation } from "@/features/languages-management";
import { UserLanguages } from "./UserLanguages";

const russian: AssignedLanguage = { name: "Russian", proficiency: "Native" };
const english: AssignedLanguage = { name: "English", proficiency: "A1" };

async function selectOption(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("Profile languages integration", () => {
  it("loads catalog pages on demand, reuses cached pages, and updates languages after mutations", async () => {
    const user = userEvent.setup();
    const profile = (languages: readonly AssignedLanguage[]) => ({ __typename: "Profile", id: "owner", languages });
    const updated = { ...english, proficiency: "Native" as const };
    const firstPage = vi.fn(() => ({ data: { languages: { items: [{ id: "russian", name: "Russian" }], total_pages: 2 } } }));
    const secondPage = vi.fn(() => ({ data: { languages: { items: [{ id: "english", name: "English" }], total_pages: 2 } } }));
    render(<MockedProvider mocks={[
      { request: { query: profileLanguagesQuery, variables: { userId: "owner" } }, result: { data: { profile: profile([russian]) } } },
      { request: { query: availableLanguagesQuery, variables: { page: 1 } }, result: firstPage },
      { request: { query: availableLanguagesQuery, variables: { page: 2 } }, result: secondPage },
      { request: { query: addProfileLanguageMutation, variables: { language: { userId: "owner", ...english } } }, result: { data: { profile: profile([russian, english]) } } },
      { request: { query: updateProfileLanguageMutation, variables: { language: { userId: "owner", ...updated } } }, result: { data: { profile: profile([russian, updated]) } } },
      { request: { query: removeProfileLanguagesMutation, variables: { language: { userId: "owner", name: ["Russian", "English"] } } }, result: { data: { profile: profile([]) } } },
    ]}><UserLanguages userId="owner" canEdit /></MockedProvider>);
    await user.click(await screen.findByRole("button", { name: "ADD LANGUAGE" }));
    await user.click(screen.getByRole("combobox", { name: "Language" }));
    await screen.findByText("No available options on this page.");
    expect(firstPage).toHaveBeenCalledTimes(1);
    expect(secondPage).not.toHaveBeenCalled();
    expect(screen.queryByRole("option", { name: "Russian" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Load more options" }));
    await user.click(await screen.findByRole("option", { name: "English" }));
    await user.click(screen.getByRole("button", { name: "CANCEL" }));
    await user.click(screen.getByRole("button", { name: "ADD LANGUAGE" }));
    await user.click(screen.getByRole("combobox", { name: "Language" }));
    await screen.findByText("No available options on this page.");
    await user.click(screen.getByRole("button", { name: "Load more options" }));
    await user.click(await screen.findByRole("option", { name: "English" }));
    expect(firstPage).toHaveBeenCalledTimes(1);
    expect(secondPage).toHaveBeenCalledTimes(1);
    await selectOption(user, "Language proficiency", "A1");
    await user.click(screen.getByRole("button", { name: "ADD" }));
    await user.click(await screen.findByRole("button", { name: "Update English" }));
    await selectOption(user, "Language proficiency", "Native");
    await user.click(screen.getByRole("button", { name: "SAVE" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("progressbar", { name: "English proficiency" })).toHaveAttribute("aria-valuenow", "7");
    await user.click(screen.getByRole("button", { name: "REMOVE LANGUAGES" }));
    await user.click(screen.getByRole("button", { name: "Select Russian" }));
    await user.click(screen.getByRole("button", { name: "Select English" }));
    await user.click(screen.getByRole("button", { name: "REMOVE (2)" }));
    await user.click(screen.getByRole("button", { name: "CONFIRM" }));
    expect(await screen.findByText("No languages added yet")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Current languages" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REMOVE LANGUAGES" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "ADD LANGUAGE" }));
    await user.click(screen.getByRole("combobox", { name: "Language" }));
    expect(await screen.findByRole("option", { name: "Russian" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "English" })).not.toBeInTheDocument();
    await user.keyboard("{End}");
    expect(await screen.findByRole("option", { name: "English" })).toBeInTheDocument();
    expect(firstPage).toHaveBeenCalledTimes(1);
    expect(secondPage).toHaveBeenCalledTimes(1);
  });
});
