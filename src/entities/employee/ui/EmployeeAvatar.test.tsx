import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmployeeAvatar } from "./EmployeeAvatar";

describe("EmployeeAvatar", () => {
  it("renders the profile avatar when its URL is available", () => {
    render(
      <EmployeeAvatar
        avatar="https://res.cloudinary.com/cv-gen-cloud/image/upload/avatar.png"
        email="ada@example.com"
        firstName="Ada"
      />,
    );

    expect(screen.getByRole("img", { name: "Ada avatar" }).querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("res.cloudinary.com"),
    );
  });

  it("renders the uppercased first-name initial without an avatar", () => {
    render(<EmployeeAvatar avatar={null} email="ada@example.com" firstName="ada" />);

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("uses the 40px font token for the profile avatar initial", () => {
    render(
      <EmployeeAvatar
        avatar={null}
        email="ada@example.com"
        firstName="Ada"
        size="profile"
      />,
    );

    expect(screen.getByRole("img", { name: "Ada avatar" })).toHaveClass(
      "[font-size:var(--text-profile-avatar)]",
    );
  });

  it("uses the email initial when the first name is unavailable", () => {
    render(<EmployeeAvatar avatar={null} email="ada@example.com" firstName={null} />);

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("uses the email initial when the first name is empty", () => {
    render(<EmployeeAvatar avatar={null} email="grace@example.com" firstName="   " />);

    expect(screen.getByText("G")).toBeInTheDocument();
  });
});
