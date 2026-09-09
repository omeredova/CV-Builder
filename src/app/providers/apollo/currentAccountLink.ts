import { ApolloLink } from "@apollo/client";
import { addTypenameToDocument, Observable } from "@apollo/client/utilities";
import { print } from "graphql";
import { currentAccountQuery, type CurrentAccountQueryData } from "@/entities/employee";

const accountDocument = print(addTypenameToDocument(currentAccountQuery));

/** Supplies the validated request's account to Apollo's normal hydration transport. */
export function createCurrentAccountLink(loadAccount: () => Promise<CurrentAccountQueryData["me"]>): ApolloLink {
  return new ApolloLink((operation, forward) => {
    if (print(operation.query) !== accountDocument) return forward(operation);
    return new Observable((observer) => {
      void loadAccount().then(
        (me) => {
          if (observer.closed) return;
          observer.next({ data: { me } });
          observer.complete();
        },
        (error: unknown) => observer.error(error),
      );
    });
  });
}
