import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

import type { Employee } from "@/entities/employee";

import { EmployeesTable } from "./EmployeesTable";

const employee: Employee = { departmentId: null, positionId: null,
  avatar: null,
  department: "Engineering",
  email: "ada@example.com",
  firstName: "Ada",
  id: "employee-1",
  lastName: "Lovelace",
  position: "Developer",
};

describe("EmployeesTable", () => {
  it("shows the empty state when there are no employees", () => {
    render(<EmployeesTable employees={[]} />);

    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders employee data in the same table", () => {
    render(<EmployeesTable employees={[employee]} />);

    expect(screen.queryByText("No results")).not.toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });

  it("delegates avatar and actions rendering", () => {
    render(
      <EmployeesTable
        employees={[employee]}
        renderActions={(item) => <button type="button">Edit {item.firstName}</button>}
        renderAvatar={(item) => <span>{item.firstName?.at(0)}</span>}
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Ada" })).toBeInTheDocument();
  });

  it("requests supported sorting and pagination changes", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const onSortChange = vi.fn();

    render(
      <EmployeesTable
        employees={[employee]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSortChange={onSortChange}
        page={2}
        sortBy="first_name"
        sortOrder="asc"
        totalPages={3}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sort by First Name" }));
    await user.click(screen.getByRole("link", { name: "Go to next page" }));

    expect(onSortChange).toHaveBeenCalledWith("first_name");
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows a retry action when loading fails", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <EmployeesTable
        employees={[]}
        errorMessage="Unable to load employees"
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
