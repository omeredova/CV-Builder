import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DatePicker } from "./date-picker";

function Example() {
  const [value, setValue] = useState("2024-03-15");
  return <DatePicker label="Start Date" value={value} onValueChange={setValue} min="2024-03-10" max="2024-04-20" />;
}
describe("DatePicker", () => {
  it("limits selectable dates and returns the date without a timezone conversion", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Choose start date" }));
    expect(screen.getByRole("button", { name: /March 9th, 2024/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /March 20th, 2024/ }));
    expect(screen.getByLabelText("Start Date")).toHaveValue("2024-03-20");
    expect(screen.queryByRole("button", { name: "Choose month" })).not.toBeInTheDocument();
  });
  it("supports month and year grids and restores trigger focus on Escape", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Choose start date" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Choose month" }));
    expect(screen.getByRole("button", { name: "January" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "April" }));
    await user.click(screen.getByRole("button", { name: "Choose year" }));
    expect(screen.getByRole("button", { name: "2023" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
