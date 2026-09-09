// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteSession, readSession, writeSession } from "./session";

const { get, set } = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get, set }) }));
beforeEach(() => { vi.clearAllMocks(); });

describe("server session cookies", () => {
  it("writes HttpOnly cookies with the backend lifetimes", async () => {
    await writeSession({ accessToken: "access", refreshToken: "refresh" });
    expect(set).toHaveBeenCalledWith("cv-access-token", "access", expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 }));
    expect(set).toHaveBeenCalledWith("cv-refresh-token", "refresh", expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 604800 }));
  });
  it("reads the requesting user's cookies and deletes both on logout", async () => {
    get.mockImplementation((name: string) => ({ value: name === "cv-access-token" ? "access" : "refresh" }));
    expect(await readSession()).toEqual({ accessToken: "access", refreshToken: "refresh" });
    await deleteSession();
    expect(set).toHaveBeenCalledWith("cv-access-token", "", expect.objectContaining({ maxAge: 0 }));
    expect(set).toHaveBeenCalledWith("cv-refresh-token", "", expect.objectContaining({ maxAge: 0 }));
  });
});
