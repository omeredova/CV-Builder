import { describe, expect, it } from "vitest";

import { validateVerificationCode } from "./validation";

describe("validateVerificationCode", () => {
  it("requires a code", () => {
    expect(validateVerificationCode("")).toBe("Verification code is required");
  });

  it("accepts exactly six digits", () => {
    expect(validateVerificationCode("123456")).toBeUndefined();
  });

  it("rejects incomplete and non-numeric codes", () => {
    expect(validateVerificationCode("12345")).toBe("Please enter a valid 6-digit code");
    expect(validateVerificationCode("12345a")).toBe("Please enter a valid 6-digit code");
  });
});
