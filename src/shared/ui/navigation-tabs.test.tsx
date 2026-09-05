import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NavigationTabs } from "./navigation-tabs";

describe("NavigationTabs", () => {
  it("renders links and marks the active tab", () => {
    render(
      <NavigationTabs
        activeValue="signIn"
        ariaLabel="Authentication"
        items={[
          { href: "/login", label: "Sign in", value: "signIn" },
          { href: "/register", label: "Sign up", value: "signUp" },
        ]}
      />,
    );

    expect(screen.getByRole("tab", { name: "Sign in" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("tablist", { name: "Authentication" })).toHaveStyle({
      gridTemplateColumns: "repeat(2, var(--spacing-navigation-tab-width))",
    });
  });

  it("moves focus and selection with arrows, Home, and End", async () => {
    const user = userEvent.setup();
    function Example() {
      const [active, setActive] = useState("profile");
      return <NavigationTabs activeValue={active} ariaLabel="Details" onValueChange={setActive}
        items={[{ label: "Profile", value: "profile" }, { label: "Skills", value: "skills" }, { label: "Languages", value: "languages" }]} />;
    }
    render(<Example />);
    await user.tab();
    for (const [key, name] of [["ArrowRight", "Skills"], ["End", "Languages"], ["ArrowRight", "Profile"], ["ArrowLeft", "Languages"], ["Home", "Profile"]]) {
      await user.keyboard(`{${key}}`);
      expect(screen.getByRole("tab", { name })).toHaveFocus();
      expect(screen.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
      expect(screen.getAllByRole("tab").filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
    }
  });

  it("reports button tab changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <NavigationTabs
        activeValue="profile"
        ariaLabel="Employee details"
        items={[
          { label: "Profile", value: "profile" },
          { label: "Skills", value: "skills" },
        ]}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Skills" }));
    expect(onValueChange).toHaveBeenCalledWith("skills");
  });
});
