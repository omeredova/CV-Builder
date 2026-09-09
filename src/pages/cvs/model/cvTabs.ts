export const cvTabs = [
  { label: "Details", value: "details" },
  { label: "Skills", value: "skills" },
  { label: "Projects", value: "projects" },
  { label: "Preview", value: "preview" },
] as const;

export type CvTab = (typeof cvTabs)[number]["value"];
export function isCvTab(value: string): value is CvTab {
  return cvTabs.some((tab) => tab.value === value);
}
export function getCvTab(pathname: string): CvTab {
  const tab = pathname.split("/").at(-1) ?? "details";
  return isCvTab(tab) ? tab : "details";
}
