export type PaginationToken = number | "ellipsis";

export function createPaginationTokens(page: number, totalPages: number): readonly PaginationToken[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 2) return [1, 2, "ellipsis", totalPages];
  if (page >= totalPages - 1) return [1, "ellipsis", totalPages - 1, totalPages];
  return [1, "ellipsis", page, totalPages];
}
