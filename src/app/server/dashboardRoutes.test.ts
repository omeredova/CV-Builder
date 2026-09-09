import { beforeEach, describe, expect, it, vi } from "vitest";
import CvsRoute from "../(dashboard)/cvs/page.page";
import CvRoute from "../(dashboard)/cvs/[cvId]/page.page";
import CvTabRoute from "../(dashboard)/cvs/[cvId]/[tab]/page.page";
import UserRoute from "../(dashboard)/users/[userId]/page.page";
import UserTabRoute from "../(dashboard)/users/[userId]/[tab]/page.page";
import SkillsRoute from "../(dashboard)/skills/page.page";
import LanguagesRoute from "../(dashboard)/languages/page.page";
import SettingsRoute from "../(dashboard)/settings/page.page";
import { UsersRoute } from "./UsersRoute";

const { guard } = vi.hoisted(() => ({ guard: vi.fn() }));
vi.mock("./requireSession", () => ({ requireDashboardSession: guard }));
vi.mock("../providers/apollo/serverClient", () => ({ PreloadQuery: vi.fn() }));
beforeEach(() => { guard.mockReset().mockRejectedValue(new Error("redirect:/login")); });

describe("dashboard page authorization on navigation", () => {
  it.each([
    { path: "/users", render: () => UsersRoute() },
    { path: "/cvs", render: () => CvsRoute() },
    { path: "/cvs/one", render: () => CvRoute({ params: Promise.resolve({ cvId: "one" }) }) },
    { path: "/cvs/one/projects", render: () => CvTabRoute({ params: Promise.resolve({ cvId: "one", tab: "projects" }) }) },
    { path: "/users/alice", render: () => UserRoute({ params: Promise.resolve({ userId: "alice" }) }) },
    { path: "/users/alice/skills", render: () => UserTabRoute({ params: Promise.resolve({ userId: "alice", tab: "skills" }) }) },
    { path: "/skills", render: () => SkillsRoute() },
    { path: "/languages", render: () => LanguagesRoute() },
    { path: "/settings", render: () => SettingsRoute() },
  ])("checks the session before returning $path content", async ({ render }) => {
    await expect(render()).rejects.toThrow("redirect:/login");
    expect(guard).toHaveBeenCalledOnce();
  });
});
