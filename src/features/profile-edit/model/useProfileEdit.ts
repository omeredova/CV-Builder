import { useMutation } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";

import { updateEmployeeAvatarCache, updateEmployeeNamesCache, type Employee } from "@/entities/employee";
import {
  createUpdateProfileMutation,
  type UpdateProfileData, type UpdateProfileVariables,
} from "../api/updateProfileMutation";
import {
  uploadAvatarMutation, deleteAvatarMutation,
  type UploadAvatarData, type UploadAvatarVariables, type DeleteAvatarData, type DeleteAvatarVariables,
} from "../api/avatarMutations";
import { useEmploymentEdit } from "./useEmploymentEdit";
import { readAvatarFile, validateAvatarFile } from "./avatarFile";

export type ProfileNames = Pick<Employee, "firstName" | "lastName">;
export type ProfileChanges = Partial<Pick<Employee, "firstName" | "lastName" | "avatar" | "department" | "departmentId" | "position" | "positionId">>;
export type ProfileEditStatus = "idle" | "reading" | "saving" | "uploading" | "removing";

interface ProfileEditState {
  saved: ProfileNames;
  employment: ReturnType<typeof useEmploymentEdit>;
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
  removeAvatar: () => Promise<void>;
  submit: () => Promise<void>;
}

export function validateProfileName(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required`;
  if (value.length > 100) return `${label} must be 100 characters or fewer`;
}

export function useProfileEdit(employee: Employee, canEdit: boolean, onChange?: (changes: ProfileChanges) => void): ProfileEditState {
  const employment = useEmploymentEdit(employee, canEdit);
  const [saved, setSaved] = useState<ProfileNames>({ firstName: employee.firstName, lastName: employee.lastName });
  const [firstName, setFirstName] = useState(employee.firstName ?? "");
  const [lastName, setLastName] = useState(employee.lastName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProfileEditStatus>("idle");
  const [savedAvatar, setSavedAvatar] = useState<{ source: string | null; value: string | null }>();
  const [mutate] = useMutation<UpdateProfileData, UpdateProfileVariables>(
    createUpdateProfileMutation(employment.changed),
  );
  const [upload] = useMutation<UploadAvatarData, UploadAvatarVariables>(uploadAvatarMutation);
  const [remove] = useMutation<DeleteAvatarData, DeleteAvatarVariables>(deleteAvatarMutation);
  const busy = useRef(false);
  const mounted = useRef(false);
  const persistedAvatar = savedAvatar?.source === employee.avatar ? savedAvatar.value : employee.avatar;
  const firstNameError = validateProfileName(firstName, "First name");
  const lastNameError = validateProfileName(lastName, "Last name");
  const namesChanged = firstName !== (saved.firstName ?? "") || lastName !== (saved.lastName ?? "");
  const loading = status !== "idle";
  const canSubmit = canEdit && (namesChanged || employment.changed) && !firstNameError && !lastNameError && !employment.validationErrors.department && !employment.validationErrors.position && !loading;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function selectAvatar(file: File): Promise<void> {
    if (!canEdit || busy.current) return;
    const validationError = validateAvatarFile(file);
    setAvatarError(validationError);
    if (validationError) return;
    busy.current = true;
    setStatus("reading");
    let reading = true;
    try {
      const base64 = await readAvatarFile(file);
      if (!mounted.current) return;
      reading = false;
      setStatus("uploading");
      const { data } = await upload({
        variables: { avatar: { userId: employee.id, base64, size: file.size, type: file.type } },
        context: { skipGlobalLoader: true },
        update(cache, result) {
          if (result.data?.uploadAvatar) updateEmployeeAvatarCache(cache, employee.id, result.data.uploadAvatar);
        },
      });
      if (!mounted.current) return;
      if (!data?.uploadAvatar) throw new Error("Upload failed");
      setSavedAvatar({ source: employee.avatar, value: data.uploadAvatar });
      onChange?.({ avatar: data.uploadAvatar });
    } catch {
      if (mounted.current) setAvatarError(reading ? "Unable to read avatar. Please select the image again." : "Unable to upload avatar. Please select the image again to retry.");
    } finally {
      busy.current = false;
      if (mounted.current) setStatus("idle");
    }
  }

  async function removeAvatar(): Promise<void> {
    if (!canEdit || busy.current || !persistedAvatar) return;
    busy.current = true;
    setAvatarError(null);
    setStatus("removing");
    try {
      const { data } = await remove({
        variables: { avatar: { userId: employee.id } },
        context: { skipGlobalLoader: true },
        update(cache, result) {
          if (result.data && "deleteAvatar" in result.data) updateEmployeeAvatarCache(cache, employee.id, null);
        },
      });
      if (!mounted.current) return;
      if (!data || !("deleteAvatar" in data)) throw new Error("Removal failed");
      setSavedAvatar({ source: employee.avatar, value: null });
      onChange?.({ avatar: null });
    } catch {
      if (mounted.current) setAvatarError("Unable to remove avatar. Please try again.");
    } finally {
      busy.current = false;
      if (mounted.current) setStatus("idle");
    }
  }

  async function submit(): Promise<void> {
    if (!canSubmit || busy.current) return;
    busy.current = true;
    setError(null);
    const changes: ProfileChanges = {};
    setStatus("saving");
    try {
      const userInput = employment.getInput();
      const { data, error: requestError } = await mutate({
        variables: {
          profile: { userId: employee.id, first_name: firstName, last_name: lastName },
          ...(userInput ? { user: userInput } : {}),
        },
        errorPolicy: "all",
        update(cache, result) {
          const profile = result.data?.updateProfile;
          if (profile) updateEmployeeNamesCache(cache, employee.id, profile);
        },
      });
      if (!mounted.current) return;
      if (data?.updateUser) Object.assign(changes, employment.acceptSaved(data.updateUser));
      if (data?.updateProfile) {
        const names = { firstName: data.updateProfile.first_name, lastName: data.updateProfile.last_name };
        setSaved(names);
        setFirstName(names.firstName ?? "");
        setLastName(names.lastName ?? "");
        Object.assign(changes, names);
      }
      if (requestError || !data?.updateProfile || (userInput && !data?.updateUser)) {
        throw new Error("Profile update failed");
      }
    } catch {
      if (mounted.current) {
        setError("Unable to update profile. Please try again.");
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
    saved, employment, firstName, lastName, setFirstName, setLastName, firstNameError, lastNameError,
    canSubmit, loading, error, avatarError, status, selectAvatar, removeAvatar, submit,
    avatar: persistedAvatar,
  };
}
