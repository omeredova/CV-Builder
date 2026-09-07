import { useRef, useState } from "react";

export type CollectionManagementMode<T> =
  | { kind: "view" }
  | { kind: "add" }
  | { kind: "update"; item: T }
  | { kind: "remove"; confirming: boolean };

export interface CollectionManagementOptions<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  onRemove: (keys: readonly string[]) => Promise<void>;
  removeErrorMessage: string;
}

export interface CollectionManagementState<T> {
  mode: CollectionManagementMode<T>;
  selectedKeys: readonly string[];
  removing: boolean;
  error?: string;
  reset: () => void;
  confirmRemove: () => Promise<void>;
  add: () => void;
  startRemoval: () => void;
  openConfirmation: () => void;
  closeConfirmation: () => void;
  clickItem: (item: T) => void;
}

export function useCollectionManagement<T>({ items, getKey, onRemove, removeErrorMessage }: CollectionManagementOptions<T>): CollectionManagementState<T> {
  const [mode, setMode] = useState<CollectionManagementMode<T>>({ kind: "view" });
  const [selection, setSelection] = useState<readonly string[]>([]);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);
  const itemKeys = new Set(items.map(getKey));
  const selectedKeys = selection.filter((key) => itemKeys.has(key));

  function reset(): void {
    setMode({ kind: "view" });
    setSelection([]);
    setError(undefined);
  }

  async function confirmRemove(): Promise<void> {
    if (mode.kind !== "remove" || !mode.confirming || !selectedKeys.length || pending.current) return;
    pending.current = true;
    setRemoving(true);
    setError(undefined);
    try {
      await onRemove(selectedKeys);
      reset();
    } catch {
      setError(removeErrorMessage);
    } finally {
      pending.current = false;
      setRemoving(false);
    }
  }

  return {
    mode, selectedKeys, removing, error, reset, confirmRemove,
    add() { setMode({ kind: "add" }); },
    startRemoval() { setSelection([]); setMode({ kind: "remove", confirming: false }); },
    openConfirmation() {
      if (selectedKeys.length) {
        setError(undefined);
        setMode({ kind: "remove", confirming: true });
      }
    },
    closeConfirmation() { setMode({ kind: "remove", confirming: false }); },
    clickItem(item) {
      if (pending.current) return;
      const key = getKey(item);
      if (mode.kind === "remove") {
        setSelection((previous) => previous.includes(key) ? previous.filter((selected) => selected !== key) : [...previous, key]);
      } else {
        setMode({ kind: "update", item });
      }
    },
  };
}
