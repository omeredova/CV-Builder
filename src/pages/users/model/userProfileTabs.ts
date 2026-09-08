export type UserProfileTab = "languages" | "profile" | "skills";

export const profileTabs: readonly { label: string; value: UserProfileTab }[] = [
  { label: "Profile", value: "profile" },
  { label: "Skills", value: "skills" },
  { label: "Languages", value: "languages" },
];

export function getUserProfileTab(pathname: string): UserProfileTab {
  const tab = pathname.split("/").at(-1);
  return tab === "skills" || tab === "languages" ? tab : "profile";
}

export function isUserProfileTab(value: string): value is UserProfileTab {
  return profileTabs.some((tab) => tab.value === value);
}
