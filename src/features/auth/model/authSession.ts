const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";
const verificationStartedAtKey = "verificationStartedAt";

const verificationLifetimeMs = 10 * 60 * 1000;

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
  };
}

export function saveAuthSession({ accessToken, refreshToken }: AuthSession): void {
  sessionStorage.setItem(accessTokenKey, accessToken);
  sessionStorage.setItem(refreshTokenKey, refreshToken);
}

export function saveAuthPayload(payload: AuthPayload): void {
  saveAuthSession({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  });
}

export function startVerificationSession(): void {
  sessionStorage.setItem(verificationStartedAtKey, Date.now().toString());
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(accessTokenKey);
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(accessTokenKey);
  sessionStorage.removeItem(refreshTokenKey);
  sessionStorage.removeItem(verificationStartedAtKey);
}

export function isVerificationSessionExpired(): boolean {
  const startedAt = sessionStorage.getItem(verificationStartedAtKey);

  return startedAt !== null && Date.now() - Number(startedAt) >= verificationLifetimeMs;
}
