import { cn } from "@/shared/lib/class-names";
import { Progress } from "@/shared/ui/progress";

import { languageProficiencyLevels } from "../model/proficiency";
import type { AssignedLanguage, LanguageProficiency } from "../model/types";

const languageProficiencyStyles: Readonly<Record<LanguageProficiency, string>> = {
  A1: "text-skill-novice bg-skill-novice-track",
  A2: "text-skill-advanced bg-skill-advanced-track",
  B1: "text-skill-competent bg-skill-competent-track",
  B2: "text-skill-competent bg-skill-competent-track",
  C1: "text-skill-proficient bg-skill-proficient-track",
  C2: "text-skill-proficient bg-skill-proficient-track",
  Native: "text-primary bg-primary",
};

export interface LanguageListProps {
  languages: readonly AssignedLanguage[];
}

export function LanguageList({ languages }: LanguageListProps) {
  return <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
    {languages.map((language) => (
      <li key={language.name} className="flex min-h-10 min-w-0 items-center gap-4 px-4" title={language.proficiency}>
        <Progress
          aria-label={`${language.name} proficiency`}
          getValueLabel={() => language.proficiency}
          value={languageProficiencyLevels[language.proficiency]}
          max={7}
          className={cn("h-1 w-20 shrink-0 rounded-none opacity-90 [&>[data-slot=progress-indicator]]:bg-current", languageProficiencyStyles[language.proficiency])}
        />
        <span className="min-w-0 break-words text-sm text-muted-foreground">{language.name}</span>
      </li>
    ))}
  </ul>;
}
