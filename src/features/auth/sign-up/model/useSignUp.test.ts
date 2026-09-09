import { describe, expect, it } from "vitest";

import { getRegistrationError } from "./useSignUp";

describe("getRegistrationError", () => {
  it("maps the backend duplicate-email error", () => {
    expect(getRegistrationError(new Error("userAlreadyExists"))).toBe("emailExists");
  });

  it("maps unexpected failures to a generic server error", () => {
    expect(getRegistrationError(new Error("internalServerError"))).toBe("server");
    expect(getRegistrationError("network failure")).toBe("server");
  });
});
