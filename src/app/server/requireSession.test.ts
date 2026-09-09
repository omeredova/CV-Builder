// @vitest-environment node
import { CombinedGraphQLErrors } from "@apollo/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireSession } from "./requireSession";

const { readSession, query, stop } = vi.hoisted(() => ({ readSession: vi.fn(), query: vi.fn(), stop: vi.fn() }));
vi.mock("@/features/auth/server", async () => {
  const { isUnauthorizedError } = await import("@/features/auth/model/isUnauthorizedError");
  return { readSession, isUnauthorizedError };
});
vi.mock("@/shared/api/create-backend-client", () => ({ createBackendClient: () => ({ query, stop }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
beforeEach(() => { vi.clearAllMocks(); });

describe("dashboard SSR session guard", () => {
  it("redirects anonymous requests before fetching private data", async () => {
    readSession.mockResolvedValue({});
    await expect(requireSession("/users")).rejects.toThrow("redirect:/login");
    expect(query).not.toHaveBeenCalled();
  });
  it("renews expired access through a route that can write cookies", async () => {
    readSession.mockResolvedValue({ accessToken: "expired", refreshToken: "refresh" });
    query.mockRejectedValue(new CombinedGraphQLErrors({ errors: [{ message: "Unauthorized" }] }));
    await expect(requireSession("/users")).rejects.toThrow("redirect:/auth/refresh?returnTo=%2Fusers");
    expect(stop).toHaveBeenCalledOnce();
  });
  it("does not treat a backend outage as a logged-out session", async () => {
    readSession.mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
    const outage = new Error("Backend unavailable");
    query.mockRejectedValue(outage);
    await expect(requireSession("/")).rejects.toBe(outage);
  });
});
