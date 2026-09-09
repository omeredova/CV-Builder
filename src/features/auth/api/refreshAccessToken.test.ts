import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRefreshAccessToken } from "./refreshAccessToken";

describe("refreshAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shares one backend request between concurrent refresh calls", async () => {
    const requestTokens = vi.fn().mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    const saveAuthSession = vi.fn();
    const refreshAccessToken = createRefreshAccessToken({
      getRefreshToken: () => "current-refresh-token",
      requestTokens,
      saveAuthSession,
    });

    const firstRefresh = refreshAccessToken();
    const secondRefresh = refreshAccessToken();

    expect(firstRefresh).toBe(secondRefresh);
    await expect(Promise.all([firstRefresh, secondRefresh])).resolves.toEqual([
      "new-access-token",
      "new-access-token",
    ]);
    expect(requestTokens).toHaveBeenCalledOnce();
    expect(requestTokens).toHaveBeenCalledWith("current-refresh-token");
    expect(saveAuthSession).toHaveBeenCalledWith({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
  });

  it("fails without issuing a request when the refresh token is missing", async () => {
    const requestTokens = vi.fn();
    const refreshAccessToken = createRefreshAccessToken({
      getRefreshToken: () => null,
      requestTokens,
      saveAuthSession: vi.fn(),
    });

    await expect(refreshAccessToken()).rejects.toThrow("missingRefreshToken");
    expect(requestTokens).not.toHaveBeenCalled();
  });
});
