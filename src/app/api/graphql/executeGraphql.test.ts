// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { executeGraphql, parseGraphqlRequest } from "./executeGraphql";

const { readSession, writeSession, deleteSession } = vi.hoisted(() => ({
  readSession: vi.fn(), writeSession: vi.fn(), deleteSession: vi.fn(),
}));
vi.mock("@/features/auth/server/session", () => ({ readSession, writeSession, deleteSession }));
vi.mock("@/shared/config/graphql", () => ({ graphqlUrl: "http://backend.test/graphql" }));

const fetchMock = vi.fn<typeof fetch>();
const viewer = parseGraphqlRequest({ query: "query Viewer { me { id } }" });
function response(value: unknown): Response {
  return Response.json(value);
}
function requestHeaders(index: number): Headers {
  return new Headers(fetchMock.mock.calls[index][1]?.headers);
}
const unauthorized = { errors: [{ message: "Unauthorized", extensions: { code: "UNAUTHENTICATED" } }] };

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  readSession.mockResolvedValue({ accessToken: "session-token", refreshToken: "refresh-token" });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("cookie-authenticated GraphQL transport", () => {
  it("preserves partial GraphQL data and formats backend errors", async () => {
    fetchMock.mockResolvedValue(response({ data: { me: null }, errors: [{ message: "Not allowed", extensions: { code: "FORBIDDEN", internal: "private" } }] }));
    expect(await executeGraphql(viewer, "http://localhost:3000", null)).toEqual({
      data: { me: null }, errors: [{ message: "Not allowed", extensions: { code: "FORBIDDEN" } }],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(deleteSession).not.toHaveBeenCalled();
  });

  it("does not refresh the session for a public password operation", async () => {
    fetchMock.mockResolvedValue(response(unauthorized));
    const input = parseGraphqlRequest({ query: "mutation { forgotPassword(email: \"user@example.com\") }" });
    const result = await executeGraphql(input, "http://localhost:3000", null);
    expect(result.errors?.[0].extensions?.code).toBe("UNAUTHENTICATED");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(deleteSession).not.toHaveBeenCalled();
  });

  it("preserves a password-reset token over the session cookie and forwards the origin", async () => {
    fetchMock.mockResolvedValue(response({ data: { resetPassword: null } }));
    const input = parseGraphqlRequest({ query: "mutation ResetPassword { resetPassword(auth: {newPassword: \"new\", confirmPassword: \"new\"}) }" });
    await executeGraphql(input, "http://localhost:3000", "Bearer reset-token");
    expect(requestHeaders(0).get("authorization")).toBe("Bearer reset-token");
    expect(requestHeaders(0).get("origin")).toBe("http://localhost:3000");
    expect(fetchMock.mock.calls[0][1]?.cache).toBe("no-store");
    expect(writeSession).not.toHaveBeenCalled();
  });

  it("refreshes expired cookie credentials and retries without returning tokens", async () => {
    fetchMock.mockResolvedValueOnce(response(unauthorized))
      .mockResolvedValueOnce(response({ data: { updateToken: { access_token: "new-access", refresh_token: "new-refresh" } } }))
      .mockResolvedValueOnce(response({ data: { me: { id: "user-1" } } }));
    const result = await executeGraphql(viewer, "http://localhost:3000", null);
    expect(result).toEqual({ data: { me: { id: "user-1" } } });
    expect(requestHeaders(0).get("authorization")).toBe("Bearer session-token");
    expect(requestHeaders(1).get("authorization")).toBe("Bearer refresh-token");
    expect(requestHeaders(2).get("authorization")).toBe("Bearer new-access");
    expect(writeSession).toHaveBeenCalledWith({ accessToken: "new-access", refreshToken: "new-refresh" });
  });

  it("clears an invalid session after refresh is rejected", async () => {
    fetchMock.mockImplementation(async () => response(unauthorized));
    const result = await executeGraphql(viewer, "http://localhost:3000", null);
    expect(result.errors?.[0].extensions?.code).toBe("SESSION_EXPIRED");
    expect(deleteSession).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("preserves the session on a temporary refresh outage", async () => {
    fetchMock.mockResolvedValueOnce(response(unauthorized)).mockRejectedValueOnce(new TypeError("Network unavailable"));
    await expect(executeGraphql(viewer, "http://localhost:3000", null)).rejects.toThrow();
    expect(deleteSession).not.toHaveBeenCalled();
  });

  it("does not refresh or clear a session for an invalid reset credential", async () => {
    fetchMock.mockResolvedValue(response(unauthorized));
    const result = await executeGraphql(viewer, "http://localhost:3000", "Bearer reset-token");
    expect(result.errors?.[0].extensions?.code).toBe("UNAUTHENTICATED");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(deleteSession).not.toHaveBeenCalled();
  });

  it("keeps concurrent users' credentials and caches separate", async () => {
    readSession.mockResolvedValueOnce({ accessToken: "alice" }).mockResolvedValueOnce({ accessToken: "bob" });
    fetchMock.mockImplementation(async (_url, init) => {
      const token = new Headers(init?.headers).get("authorization");
      return response({ data: { me: { id: token } } });
    });
    const results = await Promise.all([
      executeGraphql(viewer, "http://localhost:3000", null),
      executeGraphql(viewer, "http://localhost:3000", null),
    ]);
    expect(results).toEqual([{ data: { me: { id: "Bearer alice" } } }, { data: { me: { id: "Bearer bob" } } }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("browser operation validation", () => {
  it.each([
    "mutation { stolen: updateToken { access_token } }",
    "mutation { updateToken { ...Tokens } } fragment Tokens on UpdateTokenResult { refresh_token }",
    "mutation { login(auth: {email: \"e\", password: \"p\"}) { user { id } } }",
    "subscription { events }",
  ])("rejects credential operations and unsupported transport: %s", (query) => {
    expect(() => parseGraphqlRequest({ query })).toThrow();
  });
});
