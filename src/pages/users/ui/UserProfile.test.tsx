import { gql, InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { currentProfileQuery, userCreatedAtQuery, type Employee } from "@/entities/employee";

import { updateProfileMutation } from "@/features/profile-edit";

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
  it.each(["/new-avatar.png", null])("preserves an updated avatar (%s) across profile tabs before names are saved", async (avatar) => {
    const user = userEvent.setup();
    const mocks = [
      { request: { query: currentProfileQuery }, result: { data: { me: { id: employee.id } } } },
      { request: { query: userCreatedAtQuery, variables: { id: employee.id } }, result: { data: { user: { created_at: "1705233600" } } } },
    ];
    const { rerender } = render(
      <MockedProvider mocks={mocks}>
        <UserProfile employee={{ ...employee, avatar: "/old-avatar.png" }} />
      </MockedProvider>,
    );
    await screen.findByRole("button", { name: "UPDATE" });

    rerender(
      <MockedProvider mocks={mocks}>
        <UserProfile employee={{ ...employee, avatar }} />
      </MockedProvider>,
    );
    await user.click(screen.getByRole("tab", { name: "Skills" }));
    await user.click(screen.getByRole("tab", { name: "Profile" }));

    const image = screen.getByRole("img", { name: "Rostislav avatar" }).querySelector("img");
    if (avatar) expect(image).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(avatar)));
    else expect(image).toBeNull();
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
  });

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
  it.each([
    ["user-1", true, 60, 0],
    ["other-user", false, 60, 0],
    ["user-1", true, 0, 60],
    ["other-user", false, 0, 60],
  ])("checks viewer ID %s (editable: %s, ownership delay: %s, date delay: %s)", async (id, visible, ownershipDelay, dateDelay) => {
    render(
      <MockedProvider mocks={[
        { request: { query: currentProfileQuery }, delay: ownershipDelay, result: { data: { me: { id } } } },
        { request: { query: userCreatedAtQuery, variables: { id: employee.id } }, delay: dateDelay, result: { data: { user: { created_at: "1705233600" } } } },
      ]}>
        <UserProfile employee={employee} />
      </MockedProvider>,
    );
    await screen.findByText("A member since Sun Jan 14 2024");
    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Rostislav avatar" }).closest("[aria-busy]")).toHaveAttribute("aria-busy", "false");
    });
    if (visible) expect(await screen.findByRole("button", { name: "Upload avatar image" })).toBeInTheDocument();
    else expect(screen.queryByRole("button", { name: "Upload avatar image" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "First Name" }).hasAttribute("disabled")).toBe(!visible);
    expect(screen.getByRole("textbox", { name: "Last Name" }).hasAttribute("disabled")).toBe(!visible);
    expect(!!screen.queryByRole("button", { name: "UPDATE" })).toBe(visible);
  });

  it.each([false, true])("validates and saves names with normalized profile: %s", async (normalized) => {
    const user = userEvent.setup();
    const onProfileChange = vi.fn();
    const cache = new InMemoryCache();
    const fragment = gql`fragment CachedNames on User { id profile { first_name last_name avatar } }`;
    cache.writeFragment({
      id: "User:user-1",
      fragment,
      data: {
        __typename: "User", id: employee.id,
        profile: { __typename: "Profile", ...(normalized ? { id: employee.id } : {}), first_name: employee.firstName, last_name: employee.lastName, avatar: "avatar.png" },
      },
    });
    render(
      <MockedProvider cache={cache} mocks={[
        { request: { query: currentProfileQuery }, result: { data: { me: { id: employee.id } } } },
        { request: { query: userCreatedAtQuery, variables: { id: employee.id } }, result: { data: { user: { created_at: "1705233600" } } } },
        { request: { query: updateProfileMutation, variables: { profile: { userId: employee.id, first_name: "Ada", last_name: "Lovelace" } } }, delay: 50, result: { data: { updateProfile: { __typename: "Profile", id: employee.id, first_name: "Ada", last_name: "Lovelace" } } } },
      ]}>
        <UserProfile employee={employee} onProfileChange={onProfileChange} />
      </MockedProvider>,
    );
    const update = await screen.findByRole("button", { name: "UPDATE" });
    const first = screen.getByRole("textbox", { name: "First Name" });
    const last = screen.getByRole("textbox", { name: "Last Name" });
    expect(update).toBeDisabled();
    expect(first).toBeEnabled();
    expect(first).toHaveAttribute("maxlength", "100");
    expect(last).toHaveAttribute("maxlength", "100");
    await user.clear(first);
    await user.clear(last);
    expect(screen.getByText("First name is required")).toBeInTheDocument();
    expect(screen.getByText("Last name is required")).toBeInTheDocument();
    expect(update).toBeDisabled();
    fireEvent.change(first, { target: { value: "a".repeat(101) } });
    expect(screen.getByText("First name must be 100 characters or fewer")).toBeInTheDocument();
    fireEvent.change(first, { target: { value: "Ada" } });
    await user.type(last, "Lovelace");
    expect(update).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "VERIFY EMAIL" }));
    expect(onProfileChange).not.toHaveBeenCalled();
    await user.click(update);
    expect(update).toBeDisabled();
    expect(await screen.findByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(onProfileChange).toHaveBeenCalledWith({ firstName: "Ada", lastName: "Lovelace" });
    expect(cache.readFragment({ id: "User:user-1", fragment })).toMatchObject({
      profile: { first_name: "Ada", last_name: "Lovelace", avatar: "avatar.png" },
    });
    expect(update).toBeDisabled();
    expect(screen.getByDisplayValue("React")).toBeDisabled();
    expect(screen.getByDisplayValue("Software Engineer")).toBeDisabled();
  });

  it("keeps edits available for retry when saving fails", async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={[
        { request: { query: currentProfileQuery }, result: { data: { me: { id: employee.id } } } },
        { request: { query: userCreatedAtQuery, variables: { id: employee.id } }, result: { data: { user: { created_at: "1705233600" } } } },
        { request: { query: updateProfileMutation, variables: { profile: { userId: employee.id, first_name: "Ada", last_name: employee.lastName } } }, error: new Error("Failed") },
      ]}>
        <UserProfile employee={employee} />
      </MockedProvider>,
    );
    const update = await screen.findByRole("button", { name: "UPDATE" });
    fireEvent.change(screen.getByRole("textbox", { name: "First Name" }), { target: { value: "Ada" } });
    await user.click(update);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to update profile");
    expect(screen.getByRole("heading", { name: "Rostislav Harlanov" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ada")).toBeInTheDocument();
    expect(update).toBeEnabled();
  });

});
