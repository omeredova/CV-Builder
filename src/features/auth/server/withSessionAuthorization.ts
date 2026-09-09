import "server-only";

import { isUnauthorizedError } from "../model/isUnauthorizedError";
import { readSession, deleteSession } from "./session";
import { MissingSessionError, refreshSession } from "./refreshSession";

export class SessionExpiredError extends Error {}

interface SessionAuthorizationOptions {
  explicitAuthorization: string | null;
  allowSessionRefresh: boolean;
}

export async function withSessionAuthorization<T>(
  { explicitAuthorization, allowSessionRefresh }: SessionAuthorizationOptions,
  execute: (authorization: string | undefined) => Promise<T>,
): Promise<T> {
  const session = await readSession();
  try {
    return await execute(explicitAuthorization ?? (session.accessToken ? `Bearer ${session.accessToken}` : undefined));
  } catch (error) {
    if (!isUnauthorizedError(error) || explicitAuthorization || !allowSessionRefresh) throw error;
    try {
      return await execute(`Bearer ${await refreshSession()}`);
    } catch (refreshError) {
      if (!(refreshError instanceof MissingSessionError) && !isUnauthorizedError(refreshError)) throw refreshError;
      await deleteSession();
      throw new SessionExpiredError("Your session has expired");
    }
  }
}
