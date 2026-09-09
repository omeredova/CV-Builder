import { beforeEach, describe, expect, it, vi } from "vitest";
import { preferencesKey } from "./preferences";
import { readPreferences, savePreference, subscribeToPreferences } from "./preferencesStorage";

beforeEach(() => localStorage.clear());

describe("preference persistence", () => {
  it("preserves the latest other preference when saving and isolates accounts", () => {
    localStorage.setItem(preferencesKey("current"), '{"theme":"dark","language":"fr"}');
    localStorage.setItem(preferencesKey("other"), '{"theme":"light","language":"de"}');
    savePreference("current", "language", "pl");
    expect(JSON.parse(readPreferences("current") ?? "null")).toEqual({ theme: "dark", language: "pl" });
    expect(JSON.parse(readPreferences("other") ?? "null")).toEqual({ theme: "light", language: "de" });
  });

  it("notifies subscribers on saves and other-tab updates, and unsubscribes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToPreferences(listener);
    savePreference("current", "theme", "dark");
    window.dispatchEvent(new StorageEvent("storage", { key: preferencesKey("current") }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    savePreference("current", "theme", "light");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
