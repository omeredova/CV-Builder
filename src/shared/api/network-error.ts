const noInternetErrorCodes = new Set([
  "ERR_INTERNET_DISCONNECTED",
  "ERR_NETWORK",
  "NETWORK_ERROR",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasNoInternetCode(value: unknown, visited = new Set<object>()): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (visited.has(value)) {
    return false;
  }
  visited.add(value);

  if (typeof value.code === "string" && noInternetErrorCodes.has(value.code)) {
    return true;
  }

  return (
    hasNoInternetCode(value.cause, visited) ||
    hasNoInternetCode(value.extensions, visited) ||
    hasNoInternetCode(value.networkError, visited)
  );
}

export function isNoInternetError(error: unknown): boolean {
  if (hasNoInternetCode(error)) {
    return true;
  }

  if (!isRecord(error) || !Array.isArray(error.errors)) {
    return false;
  }

  return error.errors.some((item) => hasNoInternetCode(item));
}
