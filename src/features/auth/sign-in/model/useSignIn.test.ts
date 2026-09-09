import { describe, expect, it } from "vitest";

import { getAuthenticationError } from "./useSignIn";

describe("getAuthenticationError", () => {
  it("maps invalid credentials", () => {
    expect(getAuthenticationError(new Error("invalidCredentials"))).toBe(
      "invalidCredentials",
    );
  });

  it("maps unexpected failures to a server error", () => {
    expect(getAuthenticationError(new Error("internalServerError"))).toBe("server");
  });
});
