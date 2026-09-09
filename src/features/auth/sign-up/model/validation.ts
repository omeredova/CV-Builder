import {
  type PasswordConfirmationValues,
  validateEmail,
  validatePasswordConfirmation,
} from "../../model/validation";

export interface SignUpValues extends PasswordConfirmationValues {
  email: string;
}

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>;

export function validateSignUp(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = validatePasswordConfirmation(values);
  const emailError = validateEmail(values.email);

  if (emailError) {
    errors.email = emailError;
  }

  return errors;
}
