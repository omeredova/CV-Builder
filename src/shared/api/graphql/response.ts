import { CombinedGraphQLErrors } from "@apollo/client";
import type { GraphqlResult } from "./execute";

export interface GraphqlResponse {
  data?: unknown;
  errors?: readonly { message: string; extensions?: { code?: unknown } }[];
}

export function formatGraphqlResponse(result: GraphqlResult): GraphqlResponse {
  return {
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(CombinedGraphQLErrors.is(result.error) ? {
      errors: result.error.errors.map(({ message, extensions }) => ({ message, extensions: { code: extensions?.code } })),
    } : {}),
  };
}
