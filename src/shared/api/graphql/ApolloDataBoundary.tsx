"use client";

import type { ReactNode } from "react";
import type { OperationVariables } from "@apollo/client";
import { useReadQuery, type QueryRef } from "@apollo/client/react";

interface ApolloDataBoundaryProps<TData, TVariables extends OperationVariables> {
  queryRef: QueryRef<TData, TVariables>;
  children: ReactNode;
}

export function ApolloDataBoundary<TData, TVariables extends OperationVariables>({
  queryRef, children,
}: ApolloDataBoundaryProps<TData, TVariables>): ReactNode {
  useReadQuery(queryRef);
  return children;
}
