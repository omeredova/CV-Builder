export type LanguageProficiency = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native";

export interface AssignedLanguage {
  name: string;
  proficiency: LanguageProficiency;
}
