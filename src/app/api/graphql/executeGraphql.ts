import "server-only";

import { parseGraphqlRequest as parseRequest, type ParsedGraphqlRequest } from "@/shared/api/graphql/request";
import { executeGraphqlRequest } from "@/shared/api/graphql/execute";
import { formatGraphqlResponse, type GraphqlResponse } from "@/shared/api/graphql/response";
import { getGraphqlAuthPolicy, isUnauthorizedError, SessionExpiredError, withSessionAuthorization, type GraphqlAuthPolicy } from "@/features/auth/server";

interface BrowserGraphqlRequest extends ParsedGraphqlRequest { authPolicy: GraphqlAuthPolicy }

export function parseGraphqlRequest(body: unknown): BrowserGraphqlRequest {
  const input = parseRequest(body);
  return { ...input, authPolicy: getGraphqlAuthPolicy(input.document) };
}

export async function executeGraphql(input: BrowserGraphqlRequest, origin: string, explicitAuthorization: string | null): Promise<GraphqlResponse> {
  const { allowSessionRefresh } = input.authPolicy;
  try {
    return await withSessionAuthorization({ explicitAuthorization, allowSessionRefresh }, async (authorization) => {
      const result = await executeGraphqlRequest(input, { origin, ...(authorization ? { authorization } : {}) });
      if (allowSessionRefresh && !explicitAuthorization && isUnauthorizedError(result.error)) throw result.error;
      return formatGraphqlResponse(result);
    });
  } catch (error) {
    if (!(error instanceof SessionExpiredError)) throw error;
    return { errors: [{ message: error.message, extensions: { code: "SESSION_EXPIRED" } }] };
  }
}
