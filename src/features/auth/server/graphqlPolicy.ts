import { getOperationAST, Kind, visit, type DocumentNode } from "graphql";

export interface GraphqlAuthPolicy { allowSessionRefresh: boolean }

export function getGraphqlAuthPolicy(document: DocumentNode): GraphqlAuthPolicy {
  visit(document, {
    Field(field) {
      if (["login", "signup", "updateToken", "access_token", "refresh_token"].includes(field.name.value)) {
        throw new Error("Use a session action for authentication");
      }
    },
  });
  const operation = getOperationAST(document);
  if (!operation) throw new Error("Missing operation");
  const rootFields = operation.selectionSet.selections;
  const publicOperation = rootFields.length === 1 && rootFields[0].kind === Kind.FIELD &&
    ["resetPassword", "forgotPassword"].includes(rootFields[0].name.value);
  return { allowSessionRefresh: !publicOperation };
}
