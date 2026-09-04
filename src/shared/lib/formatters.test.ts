import { describe, expect, it } from "vitest";

import { formatUnixDate } from "./formatters";

describe("formatUnixDate", () => {
  it("formats a Unix timestamp in seconds", () => {
    expect(formatUnixDate(1_705_233_600)).toBe("Sun Jan 14 2024");
  });

  it("also accepts a Unix timestamp in milliseconds", () => {
    expect(formatUnixDate("1705233600000")).toBe("Sun Jan 14 2024");
  });

  it("returns null for an invalid timestamp", () => {
    expect(formatUnixDate(Number.NaN)).toBeNull();
  });
});
