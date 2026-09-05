import { describe, expect, it } from "vitest";

import { validateSignUp } from "./validation";

describe("validateSignUp", () => {
  it("returns required errors for empty values", () => {
    expect(validateSignUp({ email: "", password: "", confirmPassword: "" })).toEqual({
      email: "Email is required",
      password: "Password is required",
      confirmPassword: "Confirm Password is required",
    });
  });

  it("validates email, password length, and matching confirmation", () => {
    expect(
      validateSignUp({ email: "invalid", password: "12345", confirmPassword: "different" }),
    ).toEqual({
      email: "Please enter a valid email address",
      password: "Password must be at least 6 characters long",
      confirmPassword: "Passwords do not match",
    });
  });

  it("accepts valid values", () => {
    expect(
      validateSignUp({
        email: "user@example.com",
        password: "123456",
        confirmPassword: "123456",
      }),
    ).toEqual({});
  });
});
