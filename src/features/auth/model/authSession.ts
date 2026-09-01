const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";
const verificationStartedAtKey = "verificationStartedAt";

const verificationLifetimeMs = 10 * 60 * 1000;

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

export function saveAuthSession({ accessToken, refreshToken }: AuthSession): void {
  sessionStorage.setItem(accessTokenKey, accessToken);
  sessionStorage.setItem(refreshTokenKey, refreshToken);
}

export function startVerificationSession(): void {
  sessionStorage.setItem(verificationStartedAtKey, Date.now().toString());
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(accessTokenKey);
}

export function isVerificationSessionExpired(): boolean {
  const startedAt = sessionStorage.getItem(verificationStartedAtKey);

  return startedAt !== null && Date.now() - Number(startedAt) >= verificationLifetimeMs;
}
