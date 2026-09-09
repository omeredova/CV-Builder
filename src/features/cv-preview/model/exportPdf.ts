const styleProperties = [
  "display", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "text-transform", "text-align",
  "white-space", "overflow-wrap", "word-break", "vertical-align", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin-top", "margin-right", "margin-bottom", "margin-left", "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style", "border-collapse", "border-spacing", "gap", "list-style-type",
] as const;

export function createPdfHtml(element: HTMLElement): string {
  const copy = element.cloneNode(true) as HTMLElement;
  const originals = [element, ...element.querySelectorAll<HTMLElement>("*")];
  const copies = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
  const tokens = getComputedStyle(document.documentElement);
  const primary = tokens.getPropertyValue("--brand-primary").trim();
  originals.forEach((original, index) => {
    const target = copies[index];
    const style = getComputedStyle(original);
    target.removeAttribute("class");
    target.removeAttribute("id");
    for (const property of styleProperties) target.style.setProperty(property, style.getPropertyValue(property));

    target.style.color = original.classList.contains("text-primary") ? primary : tokens.getPropertyValue("--neutral-950").trim();
    target.style.borderColor = original.classList.contains("border-primary") ? primary : tokens.getPropertyValue("--neutral-500").trim();
    if (style.display === "grid") target.style.gridTemplateColumns = "30% minmax(0, 1fr)";
    if (original.classList.contains("sr-only")) target.style.display = "none";
    if (original.tagName === "TH" && original.closest("thead")) {
      const table = original.closest("table");
      if (table && table.clientWidth) target.style.width = `${original.clientWidth / table.clientWidth * 100}%`;
    }
  });
  copy.querySelectorAll("[data-pdf-exclude]").forEach((node) => node.remove());
  const doc = document.implementation.createHTMLDocument("CV");
  const style = doc.createElement("style");
  style.textContent = "*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}article{width:100%}p,li,td,th{overflow-wrap:anywhere}table{width:100%;table-layout:fixed}thead{display:table-header-group}tr{break-inside:avoid}h1,h2,h3,h4{break-after:avoid}ul{padding-left:1.25rem}";
  doc.head.append(style);
  doc.body.append(copy);
  return `<!doctype html>${doc.documentElement.outerHTML}`;
}

export function downloadPdf(base64: string, cvName: string): void {
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("Invalid PDF response");
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${cvName.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "cv"}.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
