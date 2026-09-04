import { describe, expect, it } from "vitest";

import { isNavigationItemActive } from "./AppSidebar";

describe("isNavigationItemActive", () => {
  it("keeps Employees active on nested employee pages", () => {
    expect(isNavigationItemActive("/users/1/profile", "/users")).toBe(true);
    expect(isNavigationItemActive("/users/1/skills", "/users")).toBe(true);
  });

  it("does not activate unrelated navigation items", () => {
    expect(isNavigationItemActive("/users/1/profile", "/skills")).toBe(false);
  });
});
