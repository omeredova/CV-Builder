import "server-only";

import { CombinedGraphQLErrors } from "@apollo/client";
import { createBackendClient } from "../create-backend-client";
import type { ParsedGraphqlRequest } from "./request";

export interface GraphqlResult {
  data?: unknown;
  error?: unknown;
}

export async function executeGraphqlRequest(input: ParsedGraphqlRequest, headers: Record<string, string>): Promise<GraphqlResult> {
  const client = createBackendClient(headers);
  try {
    const options = { variables: input.request.variables, errorPolicy: "all" as const, fetchPolicy: "no-cache" as const };
    const result = input.mutation
      ? await client.mutate({ ...options, mutation: input.document })
      : await client.query({ ...options, query: input.document });
    if (result.error && !CombinedGraphQLErrors.is(result.error)) throw result.error;
    return { data: result.data, error: result.error };
  } finally {
    client.stop();
  }
}
