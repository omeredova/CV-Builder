import type { Reference, StoreObject } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";

import { updateEmployeeAvatarCache, type Employee } from "@/entities/employee";
import {
  updateProfileMutation, updateProfileWithAvatarMutation, updateProfileWithoutAvatarMutation,
  type UpdateProfileData, type UpdateProfileVariables,
} from "../api/updateProfileMutation";
import { readAvatarFile, validateAvatarFile } from "./avatarFile";

export type ProfileNames = Pick<Employee, "firstName" | "lastName">;
export type ProfileChanges = Partial<Pick<Employee, "firstName" | "lastName" | "avatar">>;
export type ProfileEditStatus = "idle" | "reading" | "saving" | "uploading" | "removing";

type PendingAvatar = { kind: "upload"; base64: string; size: number; type: string } | { kind: "remove" };

interface ProfileEditState {
  saved: ProfileNames;
  firstName: string;
  lastName: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  firstNameError: string | undefined;
  lastNameError: string | undefined;
  canSubmit: boolean;
  loading: boolean;
  error: string | null;
  avatar: string | null;
  avatarError: string | null;
  status: ProfileEditStatus;
  selectAvatar: (file: File) => Promise<void>;
  removeAvatar: () => void;
  submit: () => Promise<void>;
}

export function validateProfileName(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required`;
  if (value.length > 100) return `${label} must be 100 characters or fewer`;
}

export function useProfileEdit(employee: Employee, canEdit: boolean, onChange?: (changes: ProfileChanges) => void): ProfileEditState {
  const [saved, setSaved] = useState<ProfileNames>({ firstName: employee.firstName, lastName: employee.lastName });
  const [firstName, setFirstName] = useState(employee.firstName ?? "");
  const [lastName, setLastName] = useState(employee.lastName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [invalidAvatar, setInvalidAvatar] = useState(false);
  const [status, setStatus] = useState<ProfileEditStatus>("idle");
  const [pendingAvatar, setPendingAvatar] = useState<PendingAvatar | null>(null);
  const [savedAvatar, setSavedAvatar] = useState<{ source: string | null; value: string | null }>();
  const [mutate] = useMutation<UpdateProfileData, UpdateProfileVariables>(
    pendingAvatar?.kind === "upload" ? updateProfileWithAvatarMutation
      : pendingAvatar ? updateProfileWithoutAvatarMutation : updateProfileMutation,
  );
  const busy = useRef(false);
  const mounted = useRef(false);
  const persistedAvatar = savedAvatar?.source === employee.avatar ? savedAvatar.value : employee.avatar;
  const firstNameError = validateProfileName(firstName, "First name");
  const lastNameError = validateProfileName(lastName, "Last name");
  const namesChanged = firstName !== (saved.firstName ?? "") || lastName !== (saved.lastName ?? "");
  const loading = status !== "idle";
  const canSubmit = canEdit && (namesChanged || pendingAvatar !== null) && !firstNameError && !lastNameError && !invalidAvatar && !loading;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function selectAvatar(file: File): Promise<void> {
    if (!canEdit || busy.current) return;
    const validationError = validateAvatarFile(file);
    setAvatarError(validationError);
    setInvalidAvatar(!!validationError);
    if (validationError) return;
    busy.current = true;
    setStatus("reading");
    try {
      const base64 = await readAvatarFile(file);
      if (!mounted.current) return;
      setPendingAvatar({ kind: "upload", base64, size: file.size, type: file.type });
    } catch {
      if (mounted.current) {
        setAvatarError("Unable to read avatar. Please select the image again.");
        setInvalidAvatar(true);
      }
    } finally {
      busy.current = false;
      if (mounted.current) setStatus("idle");
    }
  }

  function removeAvatar(): void {
    if (!canEdit || busy.current) return;
    setPendingAvatar(persistedAvatar ? { kind: "remove" } : null);
    setAvatarError(null);
    setInvalidAvatar(false);
  }

  async function submit(): Promise<void> {
    if (!canSubmit || busy.current) return;
    busy.current = true;
    setError(null);
    setAvatarError(null);
    const changes: ProfileChanges = {};
    setStatus(pendingAvatar?.kind === "upload" ? "uploading" : pendingAvatar?.kind === "remove" ? "removing" : "saving");
    try {
      const avatarInput = pendingAvatar?.kind === "upload"
        ? { userId: employee.id, base64: pendingAvatar.base64, size: pendingAvatar.size, type: pendingAvatar.type }
        : pendingAvatar ? { userId: employee.id } : undefined;
      const { data, error: requestError } = await mutate({
        variables: {
          profile: { userId: employee.id, first_name: firstName, last_name: lastName },
          ...(avatarInput ? { avatar: avatarInput } : {}),
        },
        errorPolicy: "all",
        update(cache, result) {
          const profile = result.data?.updateProfile;
          if (profile) {
            cache.modify({
              id: cache.identify({ __typename: "User", id: employee.id }),
              fields: {
                profile(existing: StoreObject | Reference | undefined, { isReference }) {
                  return isReference(existing) ? existing : { ...existing, first_name: profile.first_name, last_name: profile.last_name };
                },
              },
            });
          }
          if (result.data?.uploadAvatar) updateEmployeeAvatarCache(cache, employee.id, result.data.uploadAvatar);
          if (pendingAvatar?.kind === "remove" && result.data && "deleteAvatar" in result.data && !result.errors?.length) {
            updateEmployeeAvatarCache(cache, employee.id, null);
          }
        },
      });
      if (!mounted.current) return;
      if (data?.updateProfile) {
        const names = { firstName: data.updateProfile.first_name, lastName: data.updateProfile.last_name };
        setSaved(names);
        setFirstName(names.firstName ?? "");
        setLastName(names.lastName ?? "");
        Object.assign(changes, names);
      }
      if (pendingAvatar && (data?.uploadAvatar || (pendingAvatar.kind === "remove" && data && "deleteAvatar" in data && !requestError))) {
        const avatar = data?.uploadAvatar ?? null;
        changes.avatar = avatar;
        setSavedAvatar({ source: employee.avatar, value: avatar });
        setPendingAvatar(null);
      }
      if (requestError || !data?.updateProfile || (pendingAvatar && !("avatar" in changes))) {
        throw new Error("Profile update failed");
      }
    } catch {
      if (mounted.current) {
        setError("Unable to update profile. Please try again.");
        if (pendingAvatar && !("avatar" in changes)) {
          setAvatarError(pendingAvatar.kind === "remove" ? "Unable to remove avatar. Please try again." : "Unable to upload avatar. Please try again.");
        }
      }
    } finally {
      busy.current = false;
      if (mounted.current) {
        setStatus("idle");
        if (Object.keys(changes).length) onChange?.(changes);
      }
    }
  }

  return {
    saved, firstName, lastName, setFirstName, setLastName, firstNameError, lastNameError,
    canSubmit, loading, error, avatarError, status, selectAvatar, removeAvatar, submit,
    avatar: pendingAvatar?.kind === "upload" ? pendingAvatar.base64 : pendingAvatar?.kind === "remove" ? null : persistedAvatar,
  };
}
