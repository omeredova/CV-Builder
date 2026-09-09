import { describe, expect, it, vi } from "vitest";

import UserRoute from "@/app/(dashboard)/users/[userId]/page.page";
import UserTabRoute from "@/app/(dashboard)/users/[userId]/[tab]/page.page";
import { UserDetailsRoute } from "@/app/server/UserDetailsRoute";

vi.mock("@/app/providers/apollo/serverClient", () => ({ PreloadQuery: vi.fn() }));

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
}));

vi.mock("@/app/server/requireSession", () => ({ requireDashboardSession: vi.fn() }));

describe("employee routes", () => {
  it("opens the default profile page with the route ID", async () => {
    const page = await UserRoute({ params: Promise.resolve({ userId: "employee-1" }) });
    expect(page.type).toBe(UserDetailsRoute);
    expect(page.props).toEqual({ userId: "employee-1" });
  });

  it.each(["profile", "skills", "languages"])("opens the %s tab", async (tab) => {
    const page = await UserTabRoute({ params: Promise.resolve({ userId: "employee-1", tab }) });
    expect(page.type).toBe(UserDetailsRoute);
    expect(page.props).toEqual({ userId: "employee-1", initialTab: tab });
  });

  it("rejects an unknown tab", async () => {
    await expect(UserTabRoute({ params: Promise.resolve({ userId: "employee-1", tab: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
