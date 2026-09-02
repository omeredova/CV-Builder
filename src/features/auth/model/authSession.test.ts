import { beforeEach, describe, expect, it } from "vitest";

import { clearAuthSession, saveAuthSession, startVerificationSession } from "./authSession";

describe("clearAuthSession", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("removes authentication and verification data", () => {
    saveAuthSession({ accessToken: "access", refreshToken: "refresh" });
    startVerificationSession();

    clearAuthSession();

    expect(sessionStorage.getItem("accessToken")).toBeNull();
    expect(sessionStorage.getItem("refreshToken")).toBeNull();
    expect(sessionStorage.getItem("verificationStartedAt")).toBeNull();
  });
});
