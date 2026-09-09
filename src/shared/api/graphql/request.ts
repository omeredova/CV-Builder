import { getOperationAST, parse, separateOperations, type DocumentNode } from "graphql";

export interface GraphqlRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface ParsedGraphqlRequest {
  request: GraphqlRequest;
  document: DocumentNode;
  mutation: boolean;
}

export function parseGraphqlRequest(body: unknown): ParsedGraphqlRequest {
  if (!body || typeof body !== "object" || !("query" in body) || typeof body.query !== "string") throw new Error("Invalid GraphQL request");
  if ("variables" in body && body.variables != null && (typeof body.variables !== "object" || Array.isArray(body.variables))) throw new Error("Invalid variables");
  if ("operationName" in body && body.operationName != null && typeof body.operationName !== "string") throw new Error("Invalid operation name");
  const request = body as GraphqlRequest;
  const parsed = parse(request.query);
  const operation = getOperationAST(parsed, request.operationName);
  if (!operation || operation.operation === "subscription") throw new Error("Select a query or mutation");
  const document = separateOperations(parsed)[operation.name?.value ?? ""];
  return { request, document, mutation: operation.operation === "mutation" };
}
