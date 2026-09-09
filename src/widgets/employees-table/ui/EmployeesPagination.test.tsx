import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmployeesPagination } from "./EmployeesPagination";

describe("EmployeesPagination", () => {
  it("renders the compact sequence and changes page and page size", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(<EmployeesPagination onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} page={1} pageSize={10} totalPages={20} />);

    expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Page 2" })).toBeInTheDocument();
    expect(screen.getByText("More pages")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Page 20" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Go to next page" }));
    await user.click(screen.getByRole("button", { name: "Rows per page: 10" }));
    await user.click(screen.getByRole("menuitem", { name: "20" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
