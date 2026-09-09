import { validateEmail, validatePassword } from "../../model/validation";

export interface SignInValues {
  email: string;
  password: string;
}

export type SignInErrors = Partial<Record<keyof SignInValues, string>>;

export function validateSignIn(values: SignInValues): SignInErrors {
  const errors: SignInErrors = {};
  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}
