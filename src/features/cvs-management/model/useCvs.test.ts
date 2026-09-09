import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useQuery } from "@apollo/client/react";
import { DEFAULT_DEBOUNCE_DELAY_MS } from "@/shared/lib/use-debounced-value";
import { useCvs } from "./useCvs";

vi.mock("@apollo/client/react", () => ({ useQuery: vi.fn(() => ({})) }));
vi.mock("@/entities/employee", () => ({ useCurrentAccount: () => ({ account: { id: "owner" } }) }));

afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

describe("CV search pagination", () => {
  it("keeps the current query while typing and applies the final search on page one", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCvs());
    act(() => result.current.setPage(3));
    act(() => result.current.changeSearch("A"));
    act(() => vi.advanceTimersByTime(DEFAULT_DEBOUNCE_DELAY_MS / 2));
    act(() => result.current.changeSearch("Ada"));
    act(() => vi.advanceTimersByTime(DEFAULT_DEBOUNCE_DELAY_MS - 1));
    expect(result.current.search).toBe("Ada");
    expect(useQuery).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
      variables: expect.objectContaining({ params: expect.objectContaining({ page: 3, search: "" }) }),
    }));
    act(() => vi.advanceTimersByTime(1));
    expect(useQuery).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
      variables: expect.objectContaining({ params: expect.objectContaining({ page: 1, search: "Ada" }) }),
    }));
  });
});
