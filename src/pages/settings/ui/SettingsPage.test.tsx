import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { currentAccountQuery } from "@/entities/employee";
import { changePasswordMutation } from "@/features/auth/password-change/api/changePasswordMutation";
import { PreferencesProvider } from "@/features/account-preferences";
import { AppSidebar } from "@/widgets/app-sidebar";
import { AppShell } from "@/widgets/app-shell";
import { SettingsPage } from "./SettingsPage";

vi.mock("next/navigation", () => ({ usePathname: () => "/settings", useRouter: () => ({ replace: vi.fn() }) }));
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => vi.unstubAllGlobals());

describe("Settings keyboard navigation", () => {
  it("navigates the sidebar, menu, preferences, visibility buttons and submits using only the keyboard", async () => {
    const user = userEvent.setup();
    render(<MockedProvider mocks={[
      { request: { query: currentAccountQuery }, result: { data: { me: { id: "current", avatar: null, email: "test@example.com", first_name: "Test", last_name: "User" } } } },
      { request: { query: changePasswordMutation, variables: { args: { oldPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" } } }, result: { data: { changePassword: { id: "current" } } } },
    ]}><PreferencesProvider><AppShell sidebar={<AppSidebar />}><SettingsPage /></AppShell></PreferencesProvider></MockedProvider>);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Theme" })).toBeEnabled());
    for (const name of ["CV Builder", "Collapse sidebar", "Employees", "Skills", "Languages", "CVs"]) {
      await user.tab();
      expect(document.activeElement).toHaveAccessibleName(name);
    }
    await user.tab();
    const profileTrigger = document.activeElement;
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveFocus());
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/users/current/profile");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Logout" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(profileTrigger).toHaveFocus());
    await user.tab();
    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveFocus();
    await user.keyboard("{Enter}{Home}{ArrowDown}{Enter}");
    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.tab();
    expect(screen.getByRole("combobox", { name: "Language" })).toHaveFocus();
    await user.keyboard("f{Enter}");
    expect(screen.getByRole("combobox", { name: "Language" })).toHaveTextContent("French");
    await user.tab({ shift: true });
    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByLabelText("Password", { exact: true })).toHaveFocus();
    await user.keyboard("old-password");
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("type", "text");
    expect(document.activeElement).toHaveAttribute("aria-pressed", "true");
    await user.tab();
    expect(screen.getByLabelText("New Password")).toHaveFocus();
    await user.keyboard("new-password");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("New Password")).toHaveAttribute("type", "text");
    await user.tab();
    expect(screen.getByLabelText("Confirm Password")).toHaveFocus();
    await user.keyboard("new-password");
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByLabelText("Confirm Password")).toHaveAttribute("type", "text");
    await user.tab();
    expect(screen.getByRole("button", { name: "Change" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("status")).toHaveTextContent("Password changed successfully");
  });
});
