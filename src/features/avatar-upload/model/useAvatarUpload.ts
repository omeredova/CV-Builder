import { useMutation } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";

import { updateEmployeeAvatarCache } from "@/entities/employee";

import {
  uploadAvatarMutation,
  type UploadAvatarData,
  type UploadAvatarVariables,
} from "../api/uploadAvatarMutation";
import {
  deleteAvatarMutation,
  type DeleteAvatarData,
  type DeleteAvatarVariables,
} from "../api/deleteAvatarMutation";
import { readAvatarFile, validateAvatarFile } from "./avatarFile";

interface UseAvatarUploadOptions {
  userId: string;
  canUpload: boolean;
  avatar: string | null;
  onAvatarChange?: (avatar: string | null) => void;
}

interface AvatarUploadState {
  avatar: string | null;
  error: string | null;
  status: "idle" | "uploading" | "removing";
  upload: (file: File) => Promise<void>;
  remove: () => Promise<void>;
}

export function useAvatarUpload({
  userId,
  canUpload,
  avatar,
  onAvatarChange,
}: UseAvatarUploadOptions): AvatarUploadState {
  const [mutate] = useMutation<UploadAvatarData, UploadAvatarVariables>(
    uploadAvatarMutation,
  );
  const [deleteAvatar] = useMutation<DeleteAvatarData, DeleteAvatarVariables>(
    deleteAvatarMutation,
  );
  const [status, setStatus] = useState<AvatarUploadState["status"]>("idle");
  const [savedAvatar, setSavedAvatar] = useState<{
    source: string | null;
    value: string | null;
  }>();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function upload(file: File): Promise<void> {
    if (!canUpload || busy.current) return;
    const validationError = validateAvatarFile(file);
    setError(validationError);
    if (validationError) return;

    busy.current = true;
    setStatus("uploading");
    let uploadedUrl: string | undefined;
    try {
      const base64 = await readAvatarFile(file);
      if (!mounted.current) return;
      setPreview(base64);
      const { data } = await mutate({
        variables: {
          avatar: { userId, base64, size: file.size, type: file.type },
        },
        update(cache, result) {
          const avatar = result.data?.uploadAvatar;
          if (!avatar) return;
          updateEmployeeAvatarCache(cache, userId, avatar);
        },
      });
      if (!data?.uploadAvatar) throw new Error("No avatar URL returned");
      if (!mounted.current) return;
      setSavedAvatar({ source: avatar, value: data.uploadAvatar });
      uploadedUrl = data.uploadAvatar;
    } catch {
      setError("Unable to upload avatar. Please try again.");
    } finally {
      setPreview(null);
      setStatus("idle");
      busy.current = false;
    }
    if (uploadedUrl && mounted.current) onAvatarChange?.(uploadedUrl);
  }

  async function remove(): Promise<void> {
    if (!canUpload || busy.current) return;
    busy.current = true;
    setStatus("removing");
    setError(null);
    let removed = false;
    try {
      await deleteAvatar({
        variables: { avatar: { userId } },
        update(cache) {
          updateEmployeeAvatarCache(cache, userId, null);
        },
      });
      if (!mounted.current) return;
      setSavedAvatar({ source: avatar, value: null });
      removed = true;
    } catch {
      setError("Unable to remove avatar. Please try again.");
    } finally {
      setStatus("idle");
      busy.current = false;
    }
    if (removed && mounted.current) onAvatarChange?.(null);
  }

  return {
    avatar:
      preview ?? (savedAvatar?.source === avatar ? savedAvatar.value : avatar),
    error,
    status,
    upload,
    remove,
  };
}
