import { describe, expect, it } from "vitest";

import { getPasswordRecoveryError } from "./usePasswordRecovery";

describe("getPasswordRecoveryError", () => {
  it("maps missing-account errors", () => {
    expect(getPasswordRecoveryError(new Error("mailNotFound"))).toBe("accountNotFound");
    expect(getPasswordRecoveryError(new Error("userNotFound"))).toBe("accountNotFound");
  });

  it("maps unexpected failures to a server error", () => {
    expect(getPasswordRecoveryError(new Error("internalServerError"))).toBe("server");
  });
});
