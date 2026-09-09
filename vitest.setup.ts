import "@testing-library/jest-dom/vitest";

if (typeof document !== "undefined") {
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: () => null,
  });
}
