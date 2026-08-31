import { validateEmail, validatePassword } from "../../model/validation";

export interface SignUpValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>;

export function validateSignUp(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {};
  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
