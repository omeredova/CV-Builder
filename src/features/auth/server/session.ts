import "server-only";

import { cookies } from "next/headers";
import type { AuthSession } from "../model/authSession";

const accessCookie = "cv-access-token";
const refreshCookie = "cv-refresh-token";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function readSession(): Promise<Partial<AuthSession>> {
  const store = await cookies();
  return {
    accessToken: store.get(accessCookie)?.value,
    refreshToken: store.get(refreshCookie)?.value,
  };
}

export async function writeSession(session: AuthSession): Promise<void> {
  const store = await cookies();
  // Match the local backend's access-token and refresh-token lifetimes.
  store.set(accessCookie, session.accessToken, { ...cookieOptions, maxAge: 10 * 60 });
  store.set(refreshCookie, session.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.set(accessCookie, "", { ...cookieOptions, maxAge: 0 });
  store.set(refreshCookie, "", { ...cookieOptions, maxAge: 0 });
}
