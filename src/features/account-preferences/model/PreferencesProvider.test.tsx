import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { currentAccountQuery } from "@/entities/employee";
import { PreferenceFields } from "../ui/PreferenceFields";
import { PreferencesProvider } from "./PreferencesProvider";
import { preferencesKey } from "./preferences";

const mockAccount = { request: { query: currentAccountQuery }, result: { data: { me: { id: "current", avatar: null, email: "test@example.com", first_name: "Test", last_name: "User" } } } };
let deviceDark = false;
let onThemeChange: (() => void) | undefined;
beforeEach(() => {
  localStorage.clear();
  deviceDark = false;
  onThemeChange = undefined;
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    get matches() { return deviceDark; },
    addEventListener: (_event: string, listener: () => void) => { onThemeChange = listener; },
    removeEventListener: vi.fn(),
  })));
});
afterEach(() => vi.unstubAllGlobals());

function renderPreferences() {
  return render(<MockedProvider mocks={[mockAccount]}><PreferencesProvider><PreferenceFields /></PreferencesProvider></MockedProvider>);
}
describe("PreferencesProvider", () => {
  it("restores and saves preferences for the signed-in account across remounts", async () => {
    localStorage.setItem(preferencesKey("another"), '{"theme":"dark","language":"de"}');
    const first = renderPreferences();
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Theme" })).toBeEnabled());
    expect(screen.getByRole("combobox", { name: "Language" })).toHaveTextContent("English");
    fireEvent.click(screen.getByRole("combobox", { name: "Theme" }));
    fireEvent.click(screen.getByRole("option", { name: "Dark" }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    fireEvent.click(screen.getByRole("combobox", { name: "Language" }));
    fireEvent.click(screen.getByRole("option", { name: "French" }));
    expect(JSON.parse(localStorage.getItem(preferencesKey("current")) ?? "{}")).toEqual({ theme: "dark", language: "fr" });
    first.unmount();
    renderPreferences();
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Language" })).toHaveTextContent("French"));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  it("follows device changes only when Device settings is selected", async () => {
    renderPreferences();
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Theme" })).toBeEnabled());
    expect(document.documentElement.dataset.theme).toBe("light");
    deviceDark = true;
    onThemeChange?.();
    expect(document.documentElement.dataset.theme).toBe("dark");
    fireEvent.click(screen.getByRole("combobox", { name: "Theme" }));
    fireEvent.click(screen.getByRole("option", { name: "Light" }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("light"));
    onThemeChange?.();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
