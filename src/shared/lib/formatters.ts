export function formatName(name: string): string {
  return name.charAt(0).toLocaleUpperCase();
}

export function formatUnixDate(timestamp: number | string): string | null {
  const numericTimestamp = Number(timestamp);

  if (!Number.isFinite(numericTimestamp)) {
    return null;
  }

  const milliseconds =
    numericTimestamp < 1_000_000_000_000 ? numericTimestamp * 1_000 : numericTimestamp;
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
  })
    .format(date)
    .replaceAll(",", "");
}
