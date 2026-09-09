"use client";

import { cn } from "@/shared/lib/class-names";
import { Progress } from "@/shared/ui/progress";

import { getSkillMasteryDescription, MAX_SKILL_MASTERY_LEVEL, skillMasteryLevels } from "../model/mastery";
import type { SkillMasteryDisplay } from "../model/types";

const masteryStyles: Record<SkillMasteryDisplay, string> = {
  None: "bg-skill-zero",
  Novice: "text-skill-novice bg-skill-novice-track",
  Advanced: "text-skill-advanced bg-skill-advanced-track",
  Competent: "text-skill-competent bg-skill-competent-track",
  Proficient: "text-skill-proficient bg-skill-proficient-track",
  Expert: "text-primary bg-primary",
};

export interface SkillMasteryIndicatorProps {
  skillName: string;
  mastery: SkillMasteryDisplay;
  className?: string;
}

export function SkillMasteryIndicator({ skillName, mastery, className }: SkillMasteryIndicatorProps) {
  return (
    <Progress
      aria-label={`${skillName} mastery`}
      getValueLabel={() => getSkillMasteryDescription(mastery)}
      value={skillMasteryLevels[mastery]}
      max={MAX_SKILL_MASTERY_LEVEL}
      className={cn(
        "h-1 w-20 shrink-0 rounded-none opacity-90 [&>[data-slot=progress-indicator]]:bg-current",
        masteryStyles[mastery],
        className,
      )}
    />
  );
}
