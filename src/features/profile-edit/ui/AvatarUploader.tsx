"use client";

import { Upload, X } from "lucide-react";
import { useId, useRef } from "react";

import { EmployeeAvatar, type Employee } from "@/entities/employee";

import { cn } from "@/shared/lib/class-names";
import { Button } from "@/shared/ui/button";

import { avatarAccept } from "../model/avatarFile";
import type { ProfileEditStatus } from "../model/useProfileEdit";

export interface AvatarUploaderProps {
  employee: Pick<Employee, "id" | "avatar" | "email" | "firstName">;
  canUpload: boolean;
  isCheckingOwner?: boolean;
  avatar: string | null;
  error: string | null;
  status: ProfileEditStatus;
  onSelect: (file: File) => Promise<void>;
  onRemove: () => void;
}

export function AvatarUploader({
  employee,
  canUpload,
  isCheckingOwner = false,
  avatar,
  error,
  status,
  onSelect,
  onRemove,
}: AvatarUploaderProps) {
  const input = useRef<HTMLInputElement>(null);
  const descriptionId = useId();
  const busy = status !== "idle";

  return (
    <div
      className={cn(
        "flex max-w-full items-center justify-center gap-16 max-sm:min-h-64 max-sm:flex-col max-sm:justify-start max-sm:gap-4 max-sm:pb-16",
        isCheckingOwner && "invisible",
      )}
      aria-busy={busy || isCheckingOwner}
    >
      <div className="relative shrink-0">
        <EmployeeAvatar
          avatar={avatar}
          email={employee.email}
          firstName={employee.firstName}
          size="profile"
        />
        {canUpload && avatar && (
          <Button
            aria-label="Remove image"
            className="absolute right-0 top-0 size-6! rounded-full shadow-none hover:border-0 hover:bg-primary-active hover:text-on-primary disabled:opacity-60"
            size="icon"
            disabled={busy}
            onClick={onRemove}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>
      {(canUpload || isCheckingOwner) && (
        <div className="relative w-72 max-w-full shrink-0 text-center">
          <input
            accept={avatarAccept}
            aria-label="Select avatar image"
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void onSelect(file);
            }}
            ref={input}
            type="file"
          />
          <Button
            aria-describedby={descriptionId}
            className="gap-3 text-xl! text-foreground disabled:bg-transparent disabled:opacity-60"
            size="content"
            variant="link"
            disabled={busy}
            onClick={() => input.current?.click()}
            type="button"
          >
            <Upload aria-hidden="true" className="size-6" />
            Upload avatar image
          </Button>
          <p
            className="mt-1 text-base text-muted-foreground"
            id={descriptionId}
          >
            png, jpg, jpeg or gif no more than 5 MB
          </p>
          <div className="absolute inset-x-0 top-full pt-2 text-sm">
            {status === "uploading" && (
              <p className="text-muted-foreground" role="status">
                Uploading avatar…
              </p>
            )}
            {status === "removing" && (
              <p className="text-muted-foreground" role="status">
                Removing avatar…
              </p>
            )}
            {error && (
              <p className="text-primary" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
