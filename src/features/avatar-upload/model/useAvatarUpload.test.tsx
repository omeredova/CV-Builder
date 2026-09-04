import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as avatarFile from "./avatarFile";
import { useAvatarUpload } from "./useAvatarUpload";

afterEach(() => vi.restoreAllMocks());

describe("useAvatarUpload", () => {
  it("does not upload or notify the old profile after unmounting during file reading", async () => {
    let finishReading: (data: string) => void = () => {};
    vi.spyOn(avatarFile, "readAvatarFile").mockImplementation(
      () =>
        new Promise((resolve) => {
          finishReading = resolve;
        }),
    );
    const onAvatarChange = vi.fn();
    const { result, unmount } = renderHook(
      () =>
        useAvatarUpload({
          userId: "42",
          avatar: null,
          canUpload: true,
          onAvatarChange,
        }),
      {
        wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider>,
      },
    );
    let pending: Promise<void>;
    act(() => {
      pending = result.current.upload(
        new File(["png"], "avatar.png", { type: "image/png" }),
      );
    });
    unmount();
    await act(async () => {
      finishReading("data:image/png;base64,cG5n");
      await pending;
    });
    expect(onAvatarChange).not.toHaveBeenCalled();
  });
});
