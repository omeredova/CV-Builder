import { SetContextLink } from "@apollo/client/link/context";

import { getAccessToken } from "@/features/auth";

export const authorizationLink = new SetContextLink((previousContext) => {
  const accessToken = getAccessToken();

  return {
    headers: {
      ...previousContext.headers,
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    },
  };
});
