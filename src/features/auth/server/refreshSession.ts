import "server-only";

import { gql } from "@apollo/client";
import { createBackendClient } from "@/shared/api/create-backend-client";
import { readSession, writeSession } from "./session";

const refreshMutation = gql`
  mutation RefreshAccessToken {
    updateToken { access_token refresh_token }
  }
`;

export class MissingSessionError extends Error {}

export async function refreshSession(): Promise<string> {
  const { refreshToken } = await readSession();
  if (!refreshToken) throw new MissingSessionError("Missing session");
  const client = createBackendClient({ authorization: `Bearer ${refreshToken}` });
  try {
    const { data } = await client.mutate<{
      updateToken: { access_token: string; refresh_token: string };
    }>({ mutation: refreshMutation });
    if (!data?.updateToken) throw new Error("Missing refresh response");
    await writeSession({
      accessToken: data.updateToken.access_token,
      refreshToken: data.updateToken.refresh_token,
    });
    return data.updateToken.access_token;
  } finally {
    client.stop();
  }
}
