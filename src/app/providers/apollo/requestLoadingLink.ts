import { ApolloLink } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";

import { beginApiRequest } from "@/shared/api/request-loading-store";

export const requestLoadingLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const finishRequest = beginApiRequest();

    try {
      const subscription = forward(operation).subscribe(observer);
      subscription.add(finishRequest);

      return () => subscription.unsubscribe();
    } catch (error: unknown) {
      finishRequest();
      observer.error(error);
    }
  });
});
