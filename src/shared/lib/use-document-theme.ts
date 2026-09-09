"use client";

import { useEffect } from "react";

export type DocumentTheme = "light" | "dark" | "system";

export function useDocumentTheme(theme: DocumentTheme): void {
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.theme;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(): void {
      root.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    }

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => {
      media.removeEventListener("change", applyTheme);
      if (previousTheme === undefined) delete root.dataset.theme;
      else root.dataset.theme = previousTheme;
    };
  }, [theme]);
}
