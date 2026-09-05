import { HttpLink } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GraphQLError } from "graphql";

import { departmentsQuery, type Employee } from "@/entities/employee";
import * as avatarFile from "./avatarFile";
import { useProfileEdit } from "./useProfileEdit";
import { createUpdateProfileMutation } from "../api/updateProfileMutation";
import { uploadAvatarMutation } from "../api/avatarMutations";

const employee: Employee = {
  id: "42", avatar: null, firstName: "Ada", lastName: "Lovelace",
  email: "ada@example.com", department: "React", departmentId: "d1", position: "Engineer", positionId: "p1",
};
const file = new File(["png"], "avatar.png", { type: "image/png" });
const avatarInput = { userId: employee.id, base64: "data:image/png;base64,cG5n", size: 3, type: "image/png" };

afterEach(() => vi.restoreAllMocks());

describe("useProfileEdit", () => {
  it("uploads immediately in a separate request without saving edited names", async () => {
    const onChange = vi.fn();
    const fetchRequest = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ data: { uploadAvatar: "/saved-avatar.png" } }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const link = new HttpLink({ uri: "https://example.com/graphql", fetch: fetchRequest });
    const { result } = renderHook(() => useProfileEdit(employee, true, onChange), {
      wrapper: ({ children }) => <MockedProvider link={link}>{children}</MockedProvider>,
    });
    act(() => result.current.setFirstName("Grace"));
    await act(async () => { await result.current.selectAvatar(file); });
    expect(fetchRequest).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchRequest.mock.calls[0][1]?.body)) as { query: string; variables: unknown };
    expect(body.query).toContain("uploadAvatar(avatar: $avatar)");
    expect(body.query).not.toContain("updateProfile");
    expect(body.variables).toEqual({ avatar: avatarInput });
    expect(onChange).toHaveBeenCalledWith({ avatar: "/saved-avatar.png" });
    expect(result.current.saved.firstName).toBe("Ada");
    expect(result.current.firstName).toBe("Grace");
    expect(result.current.canSubmit).toBe(true);
  });

  it("uploads even when profile fields are invalid without enabling UPDATE", async () => {
    const { result } = renderHook(() => useProfileEdit({ ...employee, firstName: "" }, true), {
      wrapper: ({ children }) => <MockedProvider mocks={[{ request: { query: uploadAvatarMutation, variables: { avatar: avatarInput } }, result: { data: { uploadAvatar: "/new.png" } } }]}>{children}</MockedProvider>,
    });
    await act(async () => { await result.current.selectAvatar(file); });
    expect(result.current.avatar).toBe("/new.png");
    expect(result.current.canSubmit).toBe(false);
  });

  it("preserves the old avatar after failure and retries by selecting the same file", async () => {
    const request = { query: uploadAvatarMutation, variables: { avatar: avatarInput } };
    const { result } = renderHook(() => useProfileEdit({ ...employee, avatar: "/old.png" }, true), {
      wrapper: ({ children }) => <MockedProvider mocks={[
        { request, error: new Error("Failed") },
        { request, result: { data: { uploadAvatar: "/new.png" } } },
      ]}>{children}</MockedProvider>,
    });
    await act(async () => { await result.current.selectAvatar(file); });
    expect(result.current.avatarError).toContain("Unable to upload avatar");
    expect(result.current.avatar).toBe("/old.png");
    await act(async () => { await result.current.selectAvatar(file); });
    expect(result.current.avatar).toBe("/new.png");
    expect(result.current.avatarError).toBeNull();
    expect(result.current.canSubmit).toBe(false);
  });

  it("keeps employment edits pending when the combined profile update fails", async () => {
    const profile = { userId: employee.id, first_name: "Ada", last_name: "Lovelace" };
    const user = { userId: employee.id, departmentId: "d2", positionId: "p1" };
    const names = { id: employee.id, first_name: "Ada", last_name: "Lovelace" };
    const request = { query: createUpdateProfileMutation(true), variables: { profile, user } };
    const { result } = renderHook(() => useProfileEdit(employee, true), {
      wrapper: ({ children }) => <MockedProvider mocks={[
        { request: { query: departmentsQuery, variables: { page: 1 } }, result: { data: { options: { items: [{ id: "d2", name: "Design" }], total_pages: 1 } } } },
        { request, result: { data: { updateProfile: names }, errors: [new GraphQLError("Failed", { path: ["updateUser"] })] } },
        { request, result: { data: { updateProfile: names, updateUser: { id: employee.id, department: { id: "d2", name: "Design" }, position: { id: "p1", name: "Engineer" } } } } },
      ]}>{children}</MockedProvider>,
    });
    await act(async () => { await result.current.employment.loadOptions("department"); });
    act(() => result.current.employment.select("department", "d2"));
    await act(async () => { await result.current.submit(); });
    expect(result.current.error).toContain("Unable to update profile");
    expect(result.current.canSubmit).toBe(true);
    await act(async () => { await result.current.submit(); });
    expect(result.current.employment.saved.departmentId).toBe("d2");
    expect(result.current.canSubmit).toBe(false);
  });

  it("does not upload or notify after unmounting during file reading", async () => {
    let finishReading: (data: string) => void = () => {};
    vi.spyOn(avatarFile, "readAvatarFile").mockImplementation(() => new Promise((resolve) => { finishReading = resolve; }));
    const onChange = vi.fn();
    const { result, unmount } = renderHook(() => useProfileEdit(employee, true, onChange), { wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider> });
    let pending: Promise<void>;
    act(() => { pending = result.current.selectAvatar(file); });
    unmount();
    await act(async () => { finishReading(avatarInput.base64); await pending; });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("blocks avatar upload and removal for another employee", async () => {
    const { result } = renderHook(() => useProfileEdit(employee, false), { wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider> });
    await act(async () => { await result.current.selectAvatar(file); await result.current.removeAvatar(); });
    expect(result.current.avatar).toBeNull();
    expect(result.current.status).toBe("idle");
    expect(result.current.avatarError).toBeNull();
  });
});
