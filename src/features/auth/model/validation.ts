const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD_LENGTH = 6;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();

  if (!email) {
    return "Email is required";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address";
  }

  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) {
    return "Password is required";
  }

  if (value.length < MINIMUM_PASSWORD_LENGTH) {
    return `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters long`;
  }

  return undefined;
}
