// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cvHeaderQuery } from "@/entities/cv";
import { requireCvOwner } from "./requireCvOwner";

const { guard, query, stop } = vi.hoisted(() => ({ guard: vi.fn(), query: vi.fn(), stop: vi.fn() }));
vi.mock("./requireSession", () => ({ requireDashboardSession: guard }));
vi.mock("@/features/auth/server", () => ({ readSession: async () => ({ accessToken: "access" }) }));
vi.mock("@/shared/api/create-backend-client", () => ({ createBackendClient: () => ({ query, stop }) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

beforeEach(() => {
  vi.clearAllMocks();
  guard.mockResolvedValue({ id: "owner" });
});

describe("CV server ownership", () => {
  it("allows the authenticated owner", async () => {
    query.mockResolvedValue({ data: { cv: { id: "cv1", user: { id: "owner" } } } });
    await expect(requireCvOwner("cv1")).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledWith({ query: cvHeaderQuery, variables: { cvId: "cv1" } });
    expect(stop).toHaveBeenCalledOnce();
  });
  it.each([null, { id: "cv1", user: null }, { id: "cv1", user: { id: "other" } }])("hides missing or unowned CVs (%j)", async (cv) => {
    query.mockResolvedValue({ data: { cv } });
    await expect(requireCvOwner("cv1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(stop).toHaveBeenCalledOnce();
  });
  it("does not fetch CV data for an unauthenticated request", async () => {
    guard.mockRejectedValue(new Error("redirect:/login"));
    await expect(requireCvOwner("cv1")).rejects.toThrow("redirect:/login");
    expect(query).not.toHaveBeenCalled();
  });
  it("preserves backend failures instead of reporting a missing CV", async () => {
    query.mockRejectedValue(new Error("Backend unavailable"));
    await expect(requireCvOwner("cv1")).rejects.toThrow("Backend unavailable");
    expect(stop).toHaveBeenCalledOnce();
  });
});
