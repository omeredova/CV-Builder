import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DEBOUNCE_DELAY_MS, useDebouncedValue } from "./use-debounced-value";

afterEach(() => vi.useRealTimers());

describe("useDebouncedValue", () => {
  it("waits the default delay after the last edit, including clearing the search", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), { initialProps: { value: "" } });
    rerender({ value: "A" });
    act(() => vi.advanceTimersByTime(DEFAULT_DEBOUNCE_DELAY_MS / 2));
    rerender({ value: "Ada" });
    act(() => vi.advanceTimersByTime(DEFAULT_DEBOUNCE_DELAY_MS - 1));
    expect(result.current).toBe("");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("Ada");
    rerender({ value: "" });
    act(() => vi.advanceTimersByTime(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(result.current).toBe("");
  });

  it("cancels pending updates on unmount", () => {
    vi.useFakeTimers();
    const { rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value), { initialProps: { value: "" } });
    rerender({ value: "Ada" });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
