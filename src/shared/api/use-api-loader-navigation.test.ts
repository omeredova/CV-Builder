import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getIsApiRequestActive } from "./request-loading-store";
import { useApiLoaderNavigation } from "./use-api-loader-navigation";

describe("useApiLoaderNavigation", () => {
  it("keeps the loader active until the source page unmounts", () => {
    const { result, unmount } = renderHook(() => useApiLoaderNavigation());

    act(() => result.current());
    expect(getIsApiRequestActive()).toBe(true);

    unmount();
    expect(getIsApiRequestActive()).toBe(false);
  });
});
