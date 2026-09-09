import { gql, InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Employee } from "@/entities/employee";

import { uploadAvatarMutation, deleteAvatarMutation } from "../api/avatarMutations";
import { maxAvatarSize, validateAvatarFile } from "../model/avatarFile";
import { AvatarUploader } from "./AvatarUploader";
import { useProfileEdit, type ProfileChanges } from "../model/useProfileEdit";

function ProfileEditor({ employee, canUpload, onProfileChange }: {
  employee: Employee;
  canUpload: boolean;
  onProfileChange?: (changes: ProfileChanges) => void;
}) {
  const profile = useProfileEdit(employee, canUpload, onProfileChange);
  return <>
    <AvatarUploader employee={employee} canUpload={canUpload} avatar={profile.avatar}
      error={profile.avatarError} status={profile.status}
      onSelect={profile.selectAvatar} onRemove={profile.removeAvatar} />
    <button disabled={!profile.canSubmit} onClick={() => void profile.submit()}>UPDATE</button>
  </>;
}

const employee: Employee = { departmentId: null, positionId: null,
  id: "42",
  avatar: null,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  department: null,
  position: null,
};
const file = new File(["image"], "avatar.png", { type: "image/png" });
const request = {
  query: uploadAvatarMutation,
  variables: {
    avatar: {
      userId: "42",
      base64: "data:image/png;base64,aW1hZ2U=",
      size: 5,
      type: "image/png",
    },
  },
};

describe("AvatarUploader", () => {
  it("hides the file picker and trigger when upload is not permitted", () => {
    render(
      <MockedProvider>
        <ProfileEditor employee={employee} canUpload={false} />
      </MockedProvider>,
    );
    expect(
      screen.queryByRole("button", { name: "Upload avatar image" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Select avatar image"),
    ).not.toBeInTheDocument();
  });

  it("rejects unsupported formats and oversized files with a visible error", () => {
    render(
      <MockedProvider>
        <ProfileEditor employee={employee} canUpload />
      </MockedProvider>,
    );
    fireEvent.change(screen.getByLabelText("Select avatar image"), {
      target: {
        files: [new File(["svg"], "avatar.svg", { type: "image/svg+xml" })],
      },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unsupported file type",
    );
    const oversized = new File(
      [new Uint8Array(maxAvatarSize + 1)],
      "avatar.png",
      { type: "image/png" },
    );
    fireEvent.change(screen.getByLabelText("Select avatar image"), {
      target: { files: [oversized] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "File size must not exceed 5 MB",
    );
  });

  it("uploads on selection with inline progress and refreshes the avatar cache", async () => {
    const onProfileChange = vi.fn();
    const url = "https://res.cloudinary.com/demo/image/upload/avatar.png";
    const cache = new InMemoryCache();
    const profileFragment = gql`
      fragment AvatarTest on User {
        id
        profile {
          avatar
        }
      }
    `;
    cache.writeFragment({
      id: "User:42",
      fragment: profileFragment,
      data: {
        __typename: "User",
        id: "42",
        profile: { __typename: "Profile", avatar: null },
      },
    });
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          { request, delay: 100, result: { data: { uploadAvatar: url } } },
        ]}
      >
        <ProfileEditor
          employee={employee}
          canUpload
          onProfileChange={onProfileChange}
        />
      </MockedProvider>,
    );
    fireEvent.change(screen.getByLabelText("Select avatar image"), {
      target: { files: [file] },
    });
    const progress = await screen.findByRole("progressbar", { name: "Avatar upload progress" });
    expect(progress).not.toHaveAttribute("aria-valuenow");
    expect(screen.getByRole("button", { name: "Upload avatar image" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
    await waitFor(() => expect(onProfileChange).toHaveBeenCalledWith({ avatar: url }));
    expect(screen.getByRole("img").querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("cloudinary"),
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload avatar image" }),
    ).toBeEnabled();
    expect(
      cache.readFragment({ id: "User:42", fragment: profileFragment }),
    ).toMatchObject({ profile: { avatar: url } });
  });

  it("retains the saved avatar and allows selecting the file again after failure", async () => {
    const oldAvatar = "https://res.cloudinary.com/demo/image/upload/old.png";
    render(
      <MockedProvider mocks={[{ request, error: new Error("Upload failed") }]}>
        <ProfileEditor
          employee={{ ...employee, avatar: oldAvatar }}
          canUpload
        />
      </MockedProvider>,
    );
    fireEvent.change(screen.getByLabelText("Select avatar image"), {
      target: { files: [file] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to upload avatar",
    );
    expect(screen.getByRole("img").querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("old.png"),
    );
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Upload avatar image" })).toBeEnabled();
  });

  it("removes an existing avatar immediately and returns to the initial", async () => {
    const onProfileChange = vi.fn();
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: deleteAvatarMutation,
              variables: { avatar: { userId: "42" } },
            },
            result: { data: { deleteAvatar: null } },
          },
        ]}
      >
        <ProfileEditor
          employee={{
            ...employee,
            avatar: "https://res.cloudinary.com/demo/image/upload/old.png",
          }}
          canUpload
          onProfileChange={onProfileChange}
        />
      </MockedProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(onProfileChange).not.toHaveBeenCalled();
    await waitFor(() => expect(onProfileChange).toHaveBeenCalledWith({ avatar: null }));
    expect(screen.getByRole("img")).toHaveTextContent("A");
    expect(
      screen.queryByRole("button", { name: "Remove image" }),
    ).not.toBeInTheDocument();
  });

  it("preserves the old avatar when removal fails", async () => {
    const onProfileChange = vi.fn();
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: deleteAvatarMutation,
              variables: { avatar: { userId: "42" } },
            },
            error: new Error("Failed"),
          },
        ]}
      >
        <ProfileEditor
          employee={{
            ...employee,
            avatar: "https://res.cloudinary.com/demo/image/upload/old.png",
          }}
          canUpload
          onProfileChange={onProfileChange}
        />
      </MockedProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to remove avatar",
    );
    expect(onProfileChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "UPDATE" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Upload avatar image" })).toBeEnabled();
  });

  it("does not expose removal to another employee", () => {
    render(
      <MockedProvider>
        <ProfileEditor
          employee={{
            ...employee,
            avatar: "https://res.cloudinary.com/demo/image/upload/old.png",
          }}
          canUpload={false}
        />
      </MockedProvider>,
    );
    expect(
      screen.queryByRole("button", { name: "Remove image" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["png", "image/png"],
    ["jpg", "image/jpeg"],
    ["jpeg", "image/jpeg"],
    ["gif", "image/gif"],
  ])("accepts %s at the size limit", (extension, type) => {
    expect(
      validateAvatarFile(
        new File([new Uint8Array(maxAvatarSize)], `avatar.${extension}`, {
          type,
        }),
      ),
    ).toBeNull();
  });
});
