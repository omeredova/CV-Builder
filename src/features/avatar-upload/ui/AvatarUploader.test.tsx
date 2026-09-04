import { gql, InMemoryCache } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Employee } from "@/entities/employee";

import { deleteAvatarMutation } from "../api/deleteAvatarMutation";
import { uploadAvatarMutation } from "../api/uploadAvatarMutation";
import { maxAvatarSize, validateAvatarFile } from "../model/avatarFile";
import { AvatarUploader } from "./AvatarUploader";

const employee: Employee = {
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
        <AvatarUploader employee={employee} canUpload={false} />
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
        <AvatarUploader employee={employee} canUpload />
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

  it("previews selection and saves the uploaded Cloudinary URL for the target user", async () => {
    const onAvatarChange = vi.fn();
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
        <AvatarUploader
          employee={employee}
          canUpload
          onAvatarChange={onAvatarChange}
        />
      </MockedProvider>,
    );
    fireEvent.change(screen.getByLabelText("Select avatar image"), {
      target: { files: [file] },
    });
    await waitFor(() =>
      expect(screen.getByRole("img").querySelector("img")).toHaveAttribute(
        "src",
        request.variables.avatar.base64,
      ),
    );
    expect(
      screen.getByRole("button", { name: "Upload avatar image" }),
    ).toBeDisabled();
    await waitFor(() => expect(onAvatarChange).toHaveBeenCalledWith(url));
    expect(screen.getByRole("img").querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("cloudinary"),
    );
    expect(
      screen.getByRole("button", { name: "Upload avatar image" }),
    ).toBeEnabled();
    expect(
      cache.readFragment({ id: "User:42", fragment: profileFragment }),
    ).toMatchObject({ profile: { avatar: url } });
  });

  it("restores the old avatar and allows retry after an upload failure", async () => {
    const oldAvatar = "https://res.cloudinary.com/demo/image/upload/old.png";
    render(
      <MockedProvider mocks={[{ request, error: new Error("Upload failed") }]}>
        <AvatarUploader
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
    expect(
      screen.getByRole("button", { name: "Upload avatar image" }),
    ).toBeEnabled();
  });

  it("removes an existing avatar and returns to the initial after saving", async () => {
    const onAvatarChange = vi.fn();
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
        <AvatarUploader
          employee={{
            ...employee,
            avatar: "https://res.cloudinary.com/demo/image/upload/old.png",
          }}
          canUpload
          onAvatarChange={onAvatarChange}
        />
      </MockedProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(
      screen.getByRole("button", { name: "Upload avatar image" }),
    ).toBeDisabled();
    await waitFor(() => expect(onAvatarChange).toHaveBeenCalledWith(null));
    expect(screen.getByRole("img")).toHaveTextContent("A");
    expect(
      screen.queryByRole("button", { name: "Remove image" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the avatar when removal fails", async () => {
    const onAvatarChange = vi.fn();
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
        <AvatarUploader
          employee={{
            ...employee,
            avatar: "https://res.cloudinary.com/demo/image/upload/old.png",
          }}
          canUpload
          onAvatarChange={onAvatarChange}
        />
      </MockedProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to remove avatar",
    );
    expect(screen.getByRole("img").querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("old.png"),
    );
    expect(onAvatarChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Remove image" })).toBeEnabled();
  });

  it("does not expose removal to another employee", () => {
    render(
      <MockedProvider>
        <AvatarUploader
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
