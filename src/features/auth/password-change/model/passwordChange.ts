import { AUTH_SERVER_ERROR_MESSAGE, getErrorMessage } from "../../model/authError";
import { validatePassword, validatePasswordConfirmation, type PasswordConfirmationValues } from "../../model/validation";

export interface PasswordChangeValues extends PasswordConfirmationValues { oldPassword: string }
export type PasswordChangeField = keyof PasswordChangeValues;
export type PasswordChangeErrors = Partial<Record<PasswordChangeField, string>>;

export function validatePasswordChange(values: PasswordChangeValues): PasswordChangeErrors {
  const errors: PasswordChangeErrors = validatePasswordConfirmation(values);
  const oldPasswordError = validatePassword(values.oldPassword);
  if (oldPasswordError) errors.oldPassword = oldPasswordError;
  if (values.password && values.password === values.oldPassword) errors.password = "New password must differ from your current password";
  return errors;
}

export function getPasswordChangeError(error: unknown): PasswordChangeErrors & { form?: string } {
  const message = getErrorMessage(error).toLowerCase();
  if (message.includes("oldpasswordsamenewpassword")) return { password: "New password must differ from your current password" };
  if (message.includes("newpasswordtooshort")) return { password: "Password must be at least 6 characters long" };
  if (message.includes("confirmpasswordmismatch")) return { confirmPassword: "Passwords do not match" };
  if (/oldpassword|old password|current password|incorrect password|invalidpassword|invalid password/.test(message)) return { oldPassword: "Current password is incorrect" };
  if (/do not match|don't match|passwordsmismatch|passwords mismatch/.test(message)) return { confirmPassword: "Passwords do not match" };
  return { form: AUTH_SERVER_ERROR_MESSAGE };
}

