export const maxAvatarSize = 5 * 1024 * 1024;
export const avatarAccept =
  ".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif";

export function validateAvatarFile(file: File): string | null {
  if (
    !/\.(png|jpe?g|gif)$/i.test(file.name) ||
    !["image/png", "image/jpeg", "image/gif"].includes(file.type)
  ) {
    return "Unsupported file type. Please select a PNG, JPG, JPEG, or GIF image.";
  }
  if (file.size > maxAvatarSize) return "File size must not exceed 5 MB";
  if (file.size === 0)
    return "The selected file is empty. Please select an image.";
  return null;
}

export function readAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unable to read image"));
    };
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.onabort = () => reject(new Error("Image reading was cancelled"));
    reader.readAsDataURL(file);
  });
}
