import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { userCreatedAtQuery, type Employee } from "@/entities/employee";

import { UserProfile } from "./UserProfile";

const employee: Employee = {
  avatar: null,
  department: "React",
  email: "thorn_pear@icloud.com",
  firstName: "Rostislav",
  id: "user-1",
  lastName: "Harlanov",
  position: "Software Engineer",
};

afterEach(() => window.history.replaceState(null, "", "/"));

describe("UserProfile", () => {
  it("renders table data and loads created_at by user ID", async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: userCreatedAtQuery, variables: { id: employee.id } },
            result: { data: { user: { created_at: 1_705_233_600 } } },
          },
        ]}
      >
        <UserProfile employee={employee} />
      </MockedProvider>,
    );

    expect(screen.getAllByText("Rostislav Harlanov")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Employees" })).toHaveAttribute("href", "/users");
    expect(screen.getByDisplayValue("Rostislav")).toBeDisabled();
    expect(screen.getByDisplayValue("Harlanov")).toBeDisabled();
    expect(screen.getByDisplayValue("React")).toBeDisabled();
    expect(screen.getByDisplayValue("Software Engineer")).toBeDisabled();
    expect(await screen.findByText("A member since Sun Jan 14 2024")).toBeInTheDocument();
  });

  it("opens empty skills and languages pages and updates the URL", async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider>
        <UserProfile employee={employee} />
      </MockedProvider>,
    );

    await user.click(screen.getByRole("tab", { name: "Skills" }));
    expect(window.location.pathname).toBe("/users/user-1/skills");
    expect(screen.getByRole("heading", { name: "No skills yet" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Languages" }));
    expect(window.location.pathname).toBe("/users/user-1/languages");
    expect(screen.getByRole("heading", { name: "No languages yet" })).toBeInTheDocument();
  });

  it("opens the tab supplied from a refreshed URL", () => {
    render(
      <MockedProvider>
        <UserProfile employee={employee} initialTab="skills" />
      </MockedProvider>,
    );

    expect(screen.getByRole("tab", { name: "Skills" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: "No skills yet" })).toBeInTheDocument();
  });
});
