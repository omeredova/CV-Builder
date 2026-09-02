import { describe, expect, it, vi } from "vitest";

import {
  beginApiRequest,
  getIsApiRequestActive,
  subscribeToApiRequestLoading,
} from "./request-loading-store";

describe("request loading store", () => {
  it("stays active until all concurrent requests finish", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToApiRequestLoading(listener);
    const finishFirstRequest = beginApiRequest();
    const finishSecondRequest = beginApiRequest();

    expect(getIsApiRequestActive()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    finishFirstRequest();
    expect(getIsApiRequestActive()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    finishSecondRequest();
    expect(getIsApiRequestActive()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it("ignores repeated completion calls", () => {
    const finishRequest = beginApiRequest();

    finishRequest();
    finishRequest();

    expect(getIsApiRequestActive()).toBe(false);
  });
});
