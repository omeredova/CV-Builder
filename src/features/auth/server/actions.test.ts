// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signInAction, signOutAction, signUpAction } from "./actions";

const { mutate, stop, createBackendClient, writeSession, deleteSession } = vi.hoisted(() => ({
  mutate: vi.fn(), stop: vi.fn(), createBackendClient: vi.fn(), writeSession: vi.fn(), deleteSession: vi.fn(),
}));
vi.mock("@/shared/api/create-backend-client", () => ({ createBackendClient }));
vi.mock("./session", () => ({ writeSession, deleteSession }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ origin: "https://cv.example.test" }) }));
beforeEach(() => {
  vi.clearAllMocks();
  createBackendClient.mockReturnValue({ mutate, stop });
});

describe("session actions", () => {
  it("stores login credentials only in cookies and returns no token payload", async () => {
    mutate.mockResolvedValue({ data: { login: { access_token: "access", refresh_token: "refresh", user: { id: "alice" } } } });
    expect(await signInAction({ email: "alice@example.test", password: "password" })).toEqual({});
    expect(writeSession).toHaveBeenCalledWith({ accessToken: "access", refreshToken: "refresh" });
    expect(stop).toHaveBeenCalledOnce();
  });
  it("forwards signup origin and establishes the verification session", async () => {
    mutate.mockResolvedValue({ data: { signup: { access_token: "access", refresh_token: "refresh", user: { id: "alice" } } } });
    expect(await signUpAction({ email: "alice@example.test", password: "password", confirmPassword: "password" })).toEqual({});
    expect(createBackendClient).toHaveBeenCalledWith({ origin: "https://cv.example.test" });
    expect(writeSession).toHaveBeenCalledWith({ accessToken: "access", refreshToken: "refresh" });
  });
  it("keeps login errors serializable and does not create a session on failure", async () => {
    mutate.mockRejectedValue(new Error("invalidCredentials"));
    expect(await signInAction({ email: "alice@example.test", password: "password" })).toEqual({ error: "invalidCredentials" });
    expect(writeSession).not.toHaveBeenCalled();
  });
  it("deletes the server session on logout", async () => {
    await signOutAction();
    expect(deleteSession).toHaveBeenCalledOnce();
  });
});
