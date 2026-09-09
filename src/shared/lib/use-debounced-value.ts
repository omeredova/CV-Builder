import { useEffect, useState } from "react";

export const DEFAULT_DEBOUNCE_DELAY_MS = 1000;

export function useDebouncedValue<T>(value: T, delay = DEFAULT_DEBOUNCE_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(() => value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(() => value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
