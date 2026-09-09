import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";

import { graphqlUrl } from "@/shared/config/graphql";

import {
  type AuthSession,
  getRefreshToken,
  saveAuthSession,
} from "../model/authSession";

interface RefreshAccessTokenData {
  updateToken: {
    access_token: string;
    refresh_token: string;
  };
}

const refreshAccessTokenMutation = gql`
  mutation RefreshAccessToken {
    updateToken {
      access_token
      refresh_token
    }
  }
`;

const refreshClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: graphqlUrl }),
});

interface RefreshAccessTokenDependencies {
  getRefreshToken: () => string | null;
  requestTokens: (refreshToken: string) => Promise<AuthSession>;
  saveAuthSession: (session: AuthSession) => void;
}

async function requestTokens(refreshToken: string): Promise<AuthSession> {
  const result = await refreshClient.mutate<RefreshAccessTokenData>({
    context: {
      headers: { authorization: `Bearer ${refreshToken}` },
    },
    mutation: refreshAccessTokenMutation,
  });
  const tokens = result.data?.updateToken;

  if (!tokens) {
    throw new Error("missingRefreshTokenData");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

export function createRefreshAccessToken({
  getRefreshToken: readRefreshToken,
  requestTokens: updateTokens,
  saveAuthSession: persistAuthSession,
}: RefreshAccessTokenDependencies): () => Promise<string> {
  let activeRefreshRequest: Promise<string> | undefined;

  async function executeRefreshAccessToken(): Promise<string> {
    const refreshToken = readRefreshToken();

    if (!refreshToken) {
      throw new Error("missingRefreshToken");
    }

    const session = await updateTokens(refreshToken);
    persistAuthSession(session);

    return session.accessToken;
  }

  return function refreshAccessToken(): Promise<string> {
    if (!activeRefreshRequest) {
      activeRefreshRequest = executeRefreshAccessToken().finally(() => {
        activeRefreshRequest = undefined;
      });
    }

    return activeRefreshRequest;
  };
}

export const refreshAccessToken = createRefreshAccessToken({
  getRefreshToken,
  requestTokens,
  saveAuthSession,
});
