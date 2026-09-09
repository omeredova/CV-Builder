import { CombinedGraphQLErrors } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { logout } from "@/features/auth";

export function createAuthenticationErrorLink(logoutSession: () => void): ErrorLink {
  return new ErrorLink(({ error }) => {
    if (CombinedGraphQLErrors.is(error) && error.errors.some((item) => item.extensions?.code === "SESSION_EXPIRED")) {
      logoutSession();
    }
  });
}

export const authenticationErrorLink = createAuthenticationErrorLink(logout);
