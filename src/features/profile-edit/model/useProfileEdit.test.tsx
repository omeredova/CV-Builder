import { HttpLink } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as avatarFile from "./avatarFile";
import { useProfileEdit } from "./useProfileEdit";
import { updateProfileMutation, updateProfileWithAvatarMutation } from "../api/updateProfileMutation";
import { GraphQLError } from "graphql";

const employee = {
  id: "42", avatar: null, firstName: "Ada", lastName: "Lovelace",
  email: "ada@example.com", department: null, position: null,
};

afterEach(() => vi.restoreAllMocks());

describe("useProfileEdit", () => {
  it("sends exactly one HTTP request containing both the avatar and names", async () => {
    const fetchRequest = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      data: {
        uploadAvatar: "/saved-avatar.png",
        updateProfile: { id: employee.id, first_name: "Grace", last_name: "Lovelace" },
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const link = new HttpLink({ uri: "https://example.com/graphql", fetch: fetchRequest });
    const { result } = renderHook(() => useProfileEdit(employee, true), {
      wrapper: ({ children }) => <MockedProvider link={link}>{children}</MockedProvider>,
    });
    await act(async () => {
      result.current.setFirstName("Grace");
      await result.current.selectAvatar(new File(["png"], "avatar.png", { type: "image/png" }));
    });
    expect(fetchRequest).not.toHaveBeenCalled();
    await act(async () => { await result.current.submit(); });
    expect(fetchRequest).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchRequest.mock.calls[0][1]?.body)) as {
      query: string;
      variables: unknown;
    };
    expect(body.query).toContain("uploadAvatar(avatar: $avatar)");
    expect(body.query).toContain("updateProfile(profile: $profile)");
    expect(body.variables).toEqual({
      profile: { userId: employee.id, first_name: "Grace", last_name: "Lovelace" },
      avatar: { userId: employee.id, base64: "data:image/png;base64,cG5n", size: 3, type: "image/png" },
    });
    expect(result.current.avatar).toBe("/saved-avatar.png");
    expect(result.current.saved.firstName).toBe("Grace");
    expect(result.current.canSubmit).toBe(false);
  });

  it.each([false, true])("saves avatar and names together and handles a name failure: %s", async (failNames) => {
    const onProfileChange = vi.fn();
    const avatar = "https://res.cloudinary.com/demo/image/upload/new.png";
    const combinedRequest = {
      query: updateProfileWithAvatarMutation,
      variables: {
        profile: { userId: employee.id, first_name: "Grace", last_name: "Lovelace" },
        avatar: { userId: employee.id, base64: "data:image/png;base64,cG5n", size: 3, type: "image/png" },
      },
    };
    const nameResult = { id: employee.id, first_name: "Grace", last_name: "Lovelace" };
    const uploadResult = vi.fn(() => failNames
      ? { data: { uploadAvatar: avatar }, errors: [new GraphQLError("Failed", { path: ["updateProfile"] })] }
      : { data: { uploadAvatar: avatar, updateProfile: nameResult } });
    const mocks = [
      { request: combinedRequest, result: uploadResult },
      ...(failNames ? [{
        request: { query: updateProfileMutation, variables: { profile: combinedRequest.variables.profile } },
        result: { data: { updateProfile: nameResult } },
      }] : []),
    ];
    const { result } = renderHook(() => useProfileEdit(employee, true, onProfileChange), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    });
    await act(async () => {
      result.current.setFirstName("Grace");
      await result.current.selectAvatar(new File(["png"], "avatar.png", { type: "image/png" }));
    });
    expect(result.current.avatar).toBe("data:image/png;base64,cG5n");
    expect(uploadResult).not.toHaveBeenCalled();
    expect(onProfileChange).not.toHaveBeenCalled();
    expect(result.current.canSubmit).toBe(true);

    await act(async () => { await result.current.submit(); });
    if (failNames) {
      expect(result.current.error).toContain("Unable to update profile");
      expect(onProfileChange).toHaveBeenCalledWith({ avatar });
      expect(result.current.avatar).toBe(avatar);
      expect(result.current.firstName).toBe("Grace");
      expect(result.current.canSubmit).toBe(true);
      await act(async () => { await result.current.submit(); });
      expect(onProfileChange).toHaveBeenLastCalledWith({ firstName: "Grace", lastName: "Lovelace" });
    } else {
      expect(onProfileChange).toHaveBeenCalledWith({ avatar, firstName: "Grace", lastName: "Lovelace" });
    }
    expect(uploadResult).toHaveBeenCalledTimes(1);
    expect(result.current.saved.firstName).toBe("Grace");
    expect(result.current.canSubmit).toBe(false);
  });

  it("blocks UPDATE with invalid names, and cancelling a new avatar clears its pending change", async () => {
    const { result } = renderHook(() => useProfileEdit(employee, true), {
      wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider>,
    });
    await act(async () => {
      await result.current.selectAvatar(new File(["png"], "avatar.png", { type: "image/png" }));
    });
    expect(result.current.canSubmit).toBe(true);
    act(() => result.current.setFirstName(""));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.setFirstName("Ada"));
    act(() => result.current.removeAvatar());
    expect(result.current.avatar).toBeNull();
    expect(result.current.canSubmit).toBe(false);
  });

  it("keeps a failed upload pending and retries it through UPDATE", async () => {
    const request = {
      query: updateProfileWithAvatarMutation,
      variables: { profile: { userId: employee.id, first_name: "Ada", last_name: "Lovelace" }, avatar: { userId: employee.id, base64: "data:image/png;base64,cG5n", size: 3, type: "image/png" } },
    };
    const { result } = renderHook(() => useProfileEdit(employee, true), {
      wrapper: ({ children }) => <MockedProvider mocks={[
        { request, error: new Error("Upload failed") },
        { request, result: { data: { uploadAvatar: "/new.png", updateProfile: { id: employee.id, first_name: "Ada", last_name: "Lovelace" } } } },
      ]}>{children}</MockedProvider>,
    });
    await act(async () => { await result.current.selectAvatar(new File(["png"], "avatar.png", { type: "image/png" })); });
    await act(async () => { await result.current.submit(); });
    expect(result.current.avatarError).toContain("Unable to upload avatar");
    expect(result.current.canSubmit).toBe(true);
    await act(async () => { await result.current.submit(); });
    await waitFor(() => expect(result.current.avatar).toBe("/new.png"));
    expect(result.current.avatarError).toBeNull();
    expect(result.current.canSubmit).toBe(false);
  });

  it("does not upload or notify the old profile after unmounting during file reading", async () => {
    let finishReading: (data: string) => void = () => {};
    vi.spyOn(avatarFile, "readAvatarFile").mockImplementation(
      () =>
        new Promise((resolve) => {
          finishReading = resolve;
        }),
    );
    const onProfileChange = vi.fn();
    const { result, unmount } = renderHook(
      () =>
        useProfileEdit({
          id: "42", avatar: null, firstName: "Ada", lastName: "Lovelace",
          email: "ada@example.com", department: null, position: null,
        }, true, onProfileChange),
      {
        wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider>,
      },
    );
    let pending: Promise<void>;
    act(() => {
      pending = result.current.selectAvatar(
        new File(["png"], "avatar.png", { type: "image/png" }),
      );
    });
    unmount();
    await act(async () => {
      finishReading("data:image/png;base64,cG5n");
      await pending;
    });
    expect(onProfileChange).not.toHaveBeenCalled();
  });
});
