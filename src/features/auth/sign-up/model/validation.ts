export interface SignUpValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
