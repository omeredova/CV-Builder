import { describe, expect, it } from "vitest";

import { validateSignIn } from "./validation";

describe("validateSignIn", () => {
  it("returns required errors for empty values", () => {
    expect(validateSignIn({ email: "", password: "" })).toEqual({
      email: "Email is required",
      password: "Password is required",
    });
  });

  it("returns format and length errors", () => {
    expect(validateSignIn({ email: "invalid", password: "12345" })).toEqual({
      email: "Please enter a valid email address",
      password: "Password must be at least 6 characters long",
    });
  });

  it("accepts valid values", () => {
    expect(validateSignIn({ email: "user@example.com", password: "123456" })).toEqual({});
  });
});
