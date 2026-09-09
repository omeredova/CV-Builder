import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { departmentsQuery, positionsQuery, type Employee } from "@/entities/employee";
import { useEmploymentEdit } from "./useEmploymentEdit";

const employee: Employee = { departmentId: "d1", positionId: "p1", id: "1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", avatar: null, department: "React", position: "Engineer" };

describe("useEmploymentEdit", () => {
  it("uses IDs from props without a user query or role and caches every options page", async () => {
    const firstPage = vi.fn(() => ({ data: { options: { items: [{ id: "d1", name: "React" }], total_pages: 2 } } }));
    const secondPage = vi.fn(() => ({ data: { options: { items: [{ id: "d2", name: "Design" }], total_pages: 2 } } }));
    function Wrapper({ children }: PropsWithChildren) {
      return <MockedProvider mocks={[
        { request: { query: departmentsQuery, variables: { page: 1 } }, result: firstPage, maxUsageCount: 2 },
        { request: { query: departmentsQuery, variables: { page: 2 } }, result: secondPage, maxUsageCount: 2 },
      ]}>{children}</MockedProvider>;
    }
    const { result } = renderHook(() => useEmploymentEdit({ ...employee }, true), { wrapper: Wrapper });
    expect(firstPage).not.toHaveBeenCalled();
    await act(async () => { await result.current.loadOptions("department"); });
    expect(result.current.options.department.items).toHaveLength(2);
    expect(secondPage).toHaveBeenCalledTimes(1);
    act(() => result.current.select("department", "d2"));
    expect(result.current.changed).toBe(true);
    expect(result.current.getInput()).toEqual({ userId: "1", departmentId: "d2", positionId: "p1" });
    act(() => { result.current.acceptSaved({ id: "1", department: { id: "d2", name: "Design" }, position: { id: "p1", name: "Engineer" } }); });
    expect(result.current.saved.department).toBe("Design");
    expect(result.current.saved.departmentId).toBe("d2");
    expect(result.current.saved.positionId).toBe("p1");
    expect(result.current.changed).toBe(false);
    await act(async () => { await result.current.loadOptions("department"); });
    expect(firstPage).toHaveBeenCalledTimes(1);
    expect(secondPage).toHaveBeenCalledTimes(1);
    expect(result.current.options.department.items).toHaveLength(2);
  });

  it("exposes failures, retries on reopening, and handles an empty table", async () => {
    const emptyResult = vi.fn(() => ({ data: { options: { items: [], total_pages: 0 } } }));
    function Wrapper({ children }: PropsWithChildren) {
      return <MockedProvider mocks={[
        { request: { query: positionsQuery, variables: { page: 1 } }, error: new Error("Offline") },
        { request: { query: positionsQuery, variables: { page: 1 } }, result: emptyResult, maxUsageCount: 2 },
      ]}>{children}</MockedProvider>;
    }
    const { result } = renderHook(() => useEmploymentEdit(employee, true), { wrapper: Wrapper });
    await act(async () => { await result.current.loadOptions("position"); });
    expect(result.current.options.position.error).toBe("Unable to load positions");
    await act(async () => { await result.current.loadOptions("position"); });
    expect(result.current.options.position).toEqual({ items: [], loading: false });
    await act(async () => { await result.current.loadOptions("position"); });
    expect(emptyResult).toHaveBeenCalledTimes(1);
    expect(result.current.options.position).toEqual({ items: [], loading: false });
  });

  it("does not fetch or save for another user's profile", async () => {
    const { result } = renderHook(() => useEmploymentEdit(employee, false), { wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider> });
    await act(async () => { await result.current.loadOptions("department"); result.current.select("department", "d2"); expect(result.current.getInput()).toBeUndefined(); });
    expect(result.current.options.department).toEqual({ items: [], loading: false });
    expect(result.current.changed).toBe(false);
  });
});
