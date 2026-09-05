export const VERIFICATION_CODE_LENGTH = 6;

export function validateVerificationCode(code: string): string | undefined {
  if (code.length === 0) {
    return "Verification code is required";
  }

  if (!/^\d{6}$/.test(code)) {
    return "Please enter a valid 6-digit code";
  }

  return undefined;
}
