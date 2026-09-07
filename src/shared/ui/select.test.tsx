import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

const options = [{ value: "1", label: "React" }, { value: "2", label: "Design" }];

describe("Select", () => {
  it("keeps the load-more control keyboard accessible and returns focus on Escape", async () => {
    const user = userEvent.setup();
    render(<Select label="Skill" value="" options={[]} hasMore onLoadMore={vi.fn()} onValueChange={vi.fn()} />);
    const control = screen.getByRole("combobox");
    await user.click(control);
    await user.tab();
    expect(screen.getByRole("button", { name: "Load more options" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(control).toHaveFocus();
  });

  it("loads more with the keyboard and keeps existing options selectable during loading", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    const onValueChange = vi.fn();
    const { rerender } = render(<Select label="Skill" value="" options={options} hasMore onLoadMore={onLoadMore} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    expect(onLoadMore).not.toHaveBeenCalled();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<Select label="Skill" value="" options={options} hasMore loading onLoadMore={onLoadMore} onValueChange={onValueChange} />);
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    await user.keyboard("{ArrowDown}");
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("2");
  });

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

describe("Select keyboard shortcuts", () => {
  it("opens with Space, handles Home/End while closed, and commits on Tab", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<><Select label="Department" value="1" options={options} onValueChange={onValueChange} onOpen={vi.fn()} /><button>Next</button></>);
    const control = screen.getByRole("combobox");
    await user.tab();
    await user.keyboard(" {Escape}{End}");
    expect(control).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Design" }).id);
    await user.tab();
    expect(onValueChange).toHaveBeenCalledWith("2");
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.tab({ shift: true });
    await user.keyboard("{Home}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("1");
    expect(control).toHaveFocus();
  });

  it("supports closed typeahead, repeated-letter cycling, and Escape without changing the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select label="Language" value="en" options={[{value:"en",label:"English"},{value:"pl",label:"Polish"},{value:"pt",label:"Portuguese"}]} onValueChange={onValueChange} onOpen={vi.fn()} />);
    await user.tab();
    await user.keyboard("p");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-activedescendant", screen.getByRole("option", {name:"Polish"}).id);
    await user.keyboard("p");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-activedescendant", screen.getByRole("option", {name:"Portuguese"}).id);
    await user.keyboard("{Escape}");
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard("pol{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("pl");
  });
});
