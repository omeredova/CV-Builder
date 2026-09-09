import type { ApolloClient } from "@apollo/client";

import type { EmploymentField, EmploymentOption } from "../model/types";
import { departmentsQuery, positionsQuery, type EmploymentOptionsData } from "./employmentQueries";

export async function fetchEmploymentOptions(client: ApolloClient, field: EmploymentField): Promise<EmploymentOption[]> {
  const items: EmploymentOption[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const { data } = await client.query<EmploymentOptionsData, { page: number }>({
      query: field === "department" ? departmentsQuery : positionsQuery,
      variables: { page },
      fetchPolicy: "cache-first",
    });
    if (!data) throw new Error("Missing employment options");
    items.push(...data.options.items);
    totalPages = data.options.total_pages;
    page += 1;
  } while (page <= totalPages);

  return items;
}
