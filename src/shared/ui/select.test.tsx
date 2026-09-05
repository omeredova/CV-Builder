import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

const options = [{ value: "1", label: "React" }, { value: "2", label: "Design" }];

describe("Select", () => {
  it("supports keyboard navigation, selection, Escape, and focus retention", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpen = vi.fn();
    render(<Select label="Department" value="1" options={options} onValueChange={onValueChange} onOpen={onOpen} />);
    const control = screen.getByRole("combobox", { name: "Department" });
    await user.tab();
    await user.keyboard("{ArrowDown}{End}{Enter}");
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("2");
    expect(control).toHaveFocus();
    expect(control).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Enter}d");
    expect(control).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Design" }).id);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("allows correcting invalid values and closes on outside click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<><Select label="Department" value="" error="Department is required" options={options} onValueChange={onValueChange} onOpen={vi.fn()} /><button>Outside</button></>);
    const control = screen.getByRole("combobox");
    expect(control).toHaveAttribute("aria-invalid", "true");
    await user.click(control);
    await user.click(screen.getByRole("option", { name: "React" }));
    expect(onValueChange).toHaveBeenCalledWith("1");
    await user.click(control);
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(control).toHaveAttribute("aria-expanded", "false");
  });

  it("never opens disabled controls", async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<Select label="Position" value="1" options={options} disabled onOpen={onOpen} onValueChange={vi.fn()} />);
    await user.click(screen.getByRole("combobox"));
    expect(onOpen).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
