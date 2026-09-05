import { describe, expect, it } from "vitest";

import { validatePasswordRecovery } from "./validation";

describe("validatePasswordRecovery", () => {
  it("requires an email address", () => {
    expect(validatePasswordRecovery({ email: "  " })).toEqual({ email: "Email is required" });
  });

  it("rejects invalid email addresses", () => {
    expect(validatePasswordRecovery({ email: "user@invalid" })).toEqual({
      email: "Please enter a valid email address",
    });
  });

  it("accepts and trims a valid email address", () => {
    expect(validatePasswordRecovery({ email: " user@example.com " })).toEqual({});
  });
});
