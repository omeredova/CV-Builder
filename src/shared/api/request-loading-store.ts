type RequestLoadingListener = () => void;

let activeRequestCount = 0;
const listeners = new Set<RequestLoadingListener>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function beginApiRequest(): () => void {
  activeRequestCount += 1;

  if (activeRequestCount === 1) {
    notifyListeners();
  }

  let isFinished = false;

  return () => {
    if (isFinished) return;

    isFinished = true;
    activeRequestCount = Math.max(0, activeRequestCount - 1);

    if (activeRequestCount === 0) {
      notifyListeners();
    }
  };
}

export function getIsApiRequestActive(): boolean {
  return activeRequestCount > 0;
}

export function subscribeToApiRequestLoading(listener: RequestLoadingListener): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}
