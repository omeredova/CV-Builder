import { describe, expect, it } from "vitest";
import { parsePreferences, preferencesKey } from "./preferences";

describe("account preferences", () => {
  it("recovers from corrupt or unsupported stored values", () => {
    for (const value of [null, "broken", "null", '{"theme":"invalid","language":"xx"}']) {
      expect(parsePreferences(value)).toEqual({ theme: "system", language: "en" });
    }
  });
  it("restores supported settings and isolates accounts", () => {
    expect(parsePreferences('{"theme":"dark","language":"fr"}')).toEqual({ theme: "dark", language: "fr" });
    expect(preferencesKey("1")).not.toBe(preferencesKey("2"));
  });
});
