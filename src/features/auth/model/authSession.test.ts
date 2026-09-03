import { beforeEach, describe, expect, it } from "vitest";

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
  startVerificationSession,
} from "./authSession";

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

  it("returns the current access and refresh tokens", () => {
    saveAuthSession({ accessToken: "access", refreshToken: "refresh" });

    expect(getAccessToken()).toBe("access");
    expect(getRefreshToken()).toBe("refresh");
  });
});
