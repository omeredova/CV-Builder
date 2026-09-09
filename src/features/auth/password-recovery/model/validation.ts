import { validateEmail } from "../../model/validation";

export interface PasswordRecoveryValues {
  email: string;
}

export type PasswordRecoveryErrors = Partial<Record<keyof PasswordRecoveryValues, string>>;

export function validatePasswordRecovery(
  values: PasswordRecoveryValues,
): PasswordRecoveryErrors {
  const emailError = validateEmail(values.email);

  return emailError ? { email: emailError } : {};
}
