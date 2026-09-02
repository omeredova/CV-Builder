import { describe, expect, it } from "vitest";

import { getPasswordResetError } from "./usePasswordReset";

describe("getPasswordResetError", () => {
  it("maps invalid and expired reset links", () => {
    expect(getPasswordResetError(new Error("actionExpired"))).toBe("expiredLink");
    expect(getPasswordResetError(new Error("jwt expired"))).toBe("expiredLink");
  });

  it("maps unexpected failures to a server error", () => {
    expect(getPasswordResetError(new Error("internalServerError"))).toBe("server");
  });
});
