import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Employee } from "@/entities/employee";

import { EmployeesTable } from "./EmployeesTable";

const employee: Employee = {
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
        renderAvatar={(item) => <span>{item.firstName.at(0)}</span>}
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Ada" })).toBeInTheDocument();
  });
});
