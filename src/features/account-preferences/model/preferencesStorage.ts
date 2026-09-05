import { normalizePreferences, parsePreferences, preferencesKey, type Preferences } from "./preferences";

const changeEvent = "cv-builder:preferences-changed";

export function subscribeToPreferences(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changeEvent, listener);
  };
}

export function readPreferences(userId?: string): string | null {
  try {
    return userId ? localStorage.getItem(preferencesKey(userId)) : null;
  } catch {
    return null;
  }
}

export function savePreference(userId: string, field: keyof Preferences, value: string): void {
  // Read at write time so other tabs' changes are preserved.
  const current = parsePreferences(localStorage.getItem(preferencesKey(userId)));
  const next = normalizePreferences({ ...current, [field]: value });
  localStorage.setItem(preferencesKey(userId), JSON.stringify(next));
  window.dispatchEvent(new Event(changeEvent));
}
