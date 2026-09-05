import { CombinedGraphQLErrors, ServerError } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { Observable } from "@apollo/client/utilities";

import { logout, refreshAccessToken } from "@/features/auth";

const operationsWithoutTokenRefresh = new Set([
  "ForgotPassword",
  "RefreshAccessToken",
  "ResetPassword",
  "SignIn",
  "SignUp",
]);

interface AuthenticationDependencies {
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
}

export function isUnauthorizedError(error: unknown): boolean {
  if (ServerError.is(error)) {
    return error.statusCode === 401;
  }

  if (!CombinedGraphQLErrors.is(error)) {
    return false;
  }

  return error.errors.some(
    (graphQLError) =>
      graphQLError.message.toLowerCase() === "unauthorized" ||
      graphQLError.message === "jwt expired" ||
      graphQLError.extensions?.code === "UNAUTHENTICATED",
  );
}

export function createAuthenticationErrorLink({
  logout: logoutSession,
  refreshAccessToken: refreshSession,
}: AuthenticationDependencies): ErrorLink {
  return new ErrorLink(({ error, forward, operation }) => {
    if (
      operationsWithoutTokenRefresh.has(operation.operationName ?? "") ||
      !isUnauthorizedError(error)
    ) {
      return;
    }

    return new Observable((observer) => {
      let retrySubscription: { unsubscribe: () => void } | undefined;
      let isActive = true;

      void refreshSession()
        .then((accessToken) => {
          if (!isActive) return;

          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${accessToken}`,
            },
          }));
          retrySubscription = forward(operation).subscribe(observer);
        })
        .catch(() => {
          if (!isActive) return;

          logoutSession();
          observer.error(error);
        });

      return () => {
        isActive = false;
        retrySubscription?.unsubscribe();
      };
    });
  });
}

export const authenticationErrorLink = createAuthenticationErrorLink({
  logout,
  refreshAccessToken,
});
