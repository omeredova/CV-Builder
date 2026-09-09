import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DEBOUNCE_DELAY_MS } from "@/shared/lib/use-debounced-value";
import { Multiselect } from "./multiselect";

const scrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  vi.stubGlobal("ResizeObserver", class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  if (scrollIntoView) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scrollIntoView);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

describe("Multiselect search", () => {
  it("updates text immediately, debounces filtering, and restores options when cleared", async () => {
    const onValueChange = vi.fn();
    render(<Multiselect label="Skills" value={[]} options={[{ value: "react", label: "React" }, { value: "design", label: "Design" }]} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Skills" }));
    const search = screen.getByRole("combobox", { name: "Search skills" });
    fireEvent.change(search, { target: { value: "React" } });
    expect(search).toHaveValue("React");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    await act(() => vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(screen.getAllByRole("option")).toHaveLength(1);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["react"]);
    fireEvent.change(search, { target: { value: "missing" } });
    await act(() => vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(screen.getByText("No options found")).toBeInTheDocument();
    fireEvent.change(search, { target: { value: "" } });
    await act(() => vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY_MS));
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});
