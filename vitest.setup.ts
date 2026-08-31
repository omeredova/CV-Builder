import "@testing-library/jest-dom/vitest";

Object.defineProperty(document, "elementFromPoint", {
  configurable: true,
  value: () => null,
});
