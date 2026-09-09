import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthSession, isVerificationSessionExpired, startVerificationSession } from "./authSession";

describe("browser session cleanup", () => {
  beforeEach(() => { sessionStorage.clear(); });
  it("removes legacy browser credentials and verification data", () => {
    sessionStorage.setItem("accessToken", "legacy-access");
    sessionStorage.setItem("refreshToken", "legacy-refresh");
    startVerificationSession();
    clearAuthSession();
    expect(sessionStorage.length).toBe(0);
  });
  it("keeps the verification timer without storing credentials", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1000);
    try {
      startVerificationSession();
      expect(sessionStorage.length).toBe(1);
      expect(isVerificationSessionExpired()).toBe(false);
      now.mockReturnValue(1000 + 10 * 60 * 1000);
      expect(isVerificationSessionExpired()).toBe(true);
    } finally { now.mockRestore(); }
  });
});
