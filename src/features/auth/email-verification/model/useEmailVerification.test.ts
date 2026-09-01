import { describe, expect, it } from "vitest";

import { getVerificationError } from "./useEmailVerification";

describe("getVerificationError", () => {
  it("maps invalid and expired verification errors", () => {
    expect(getVerificationError(new Error("mailNotFound"))).toBe("invalid");
    expect(getVerificationError(new Error("jwt expired"))).toBe("expired");
  });

  it("maps unexpected failures to a server error", () => {
    expect(getVerificationError(new Error("internalServerError"))).toBe("server");
  });
});
