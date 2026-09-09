import { cn } from "@/shared/lib/class-names";
import { primaryFocusRingClassName } from "@/shared/ui/styles";
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

function LanguageItemContent({ language, selected = false }: { language: AssignedLanguage; selected?: boolean }) {
  return <>
    <Progress
      aria-label={`${language.name} proficiency`}
      getValueLabel={() => language.proficiency}
      value={selected ? 0 : languageProficiencyLevels[language.proficiency]}
      max={7}
      className={cn("h-1 w-20 shrink-0 rounded-none opacity-90 [&>[data-slot=progress-indicator]]:bg-current", selected ? "bg-skill-zero text-skill-zero" : languageProficiencyStyles[language.proficiency])}
    />
    <span className="min-w-0 break-words text-sm text-muted-foreground">{language.name}</span>
  </>;
}

export interface LanguageListProps {
  languages: readonly AssignedLanguage[];
  onLanguageClick?: (language: AssignedLanguage) => void;
  selectedNames?: readonly string[];
}

export function LanguageList({ languages, onLanguageClick, selectedNames }: LanguageListProps) {
  return <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
    {languages.map((language) => (
      <li key={language.name} className="min-w-0" title={language.proficiency}>
        {onLanguageClick ? <button
          type="button"
          aria-label={`${selectedNames ? "Select" : "Update"} ${language.name}`}
          aria-pressed={selectedNames ? selectedNames.includes(language.name) : undefined}
          onClick={() => onLanguageClick(language)}
          className={cn("flex min-h-10 w-full items-center gap-4 rounded-sm px-4 text-left", primaryFocusRingClassName, !selectedNames?.includes(language.name) && "hover:bg-sidebar-accent")}
        >
          <LanguageItemContent language={language} selected={selectedNames?.includes(language.name)} />
        </button> : <div className="flex min-h-10 items-center gap-4 px-4">
          <LanguageItemContent language={language} />
        </div>}
      </li>
    ))}
  </ul>;
}
