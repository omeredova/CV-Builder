import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { currentAccountQuery } from "@/entities/employee";

import { AppSidebar } from "./AppSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/languages",
  useRouter: () => ({ replace: vi.fn() }),
}));

function renderSidebar() {
  return render(<MockedProvider mocks={[{
    request: { query: currentAccountQuery },
    result: { data: { me: {
      id: "current", avatar: null, email: "test@example.com", first_name: "Test", last_name: "User",
    } } },
  }]}><AppSidebar /></MockedProvider>);
}

describe("sidebar account menu", () => {
  it("opens on a completed avatar click and exposes account actions", async () => {
    const user = userEvent.setup();
    renderSidebar();
    const trigger = await screen.findByRole("button", { name: "Test avatar Test User" });

    await user.pointer({ target: trigger, keys: "[MouseLeft>]" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.pointer({ keys: "[/MouseLeft]" });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/users/current/profile");
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("opens on a touch tap and preserves keyboard activation", async () => {
    const user = userEvent.setup();
    renderSidebar();
    const trigger = await screen.findByRole("button", { name: "Test avatar Test User" });

    await user.pointer({ target: trigger, keys: "[TouchA]" });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.keyboard(" ");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
