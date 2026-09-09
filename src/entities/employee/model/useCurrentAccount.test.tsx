import { InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { currentAccountQuery } from "../api/currentAccountQuery";
import { updateEmployeeAvatarCache } from "../api/updateEmployeeAvatarCache";
import { useCurrentAccount } from "./useCurrentAccount";

describe("useCurrentAccount", () => {
  it("loads the avatar and observes existing upload and removal cache updates", async () => {
    const cache = new InMemoryCache();
    const mocks = [{
      request: { query: currentAccountQuery },
      result: { data: { me: {
        __typename: "Profile", id: "42", avatar: "existing.png",
        first_name: "Ada", last_name: "Lovelace", email: "ada@example.com",
      } } },
    }];
    const { result } = renderHook(() => useCurrentAccount(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider cache={cache} mocks={mocks}>{children}</MockedProvider>
      ),
    });
    await waitFor(() => expect(result.current.account?.avatar).toBe("existing.png"));
    act(() => updateEmployeeAvatarCache(cache, "42", "uploaded.png"));
    await waitFor(() => expect(result.current.account?.avatar).toBe("uploaded.png"));
    act(() => updateEmployeeAvatarCache(cache, "42", null));
    await waitFor(() => expect(result.current.account?.avatar).toBeNull());
    expect(result.current.account?.first_name).toBe("Ada");
  });
});
