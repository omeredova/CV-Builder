import { useId } from "react";

import { cn } from "@/shared/lib/class-names";
import { primaryFocusRingClassName } from "@/shared/ui/styles";

import { groupSkills } from "../model/groupSkills";
import { getSkillMasteryDescription } from "../model/mastery";
import type { AssignedSkill, SkillCategory } from "../model/types";
import { SkillMasteryIndicator } from "./SkillMasteryIndicator";

function SkillItemContent({ skill, selected = false }: { skill: AssignedSkill; selected?: boolean }) {
  return <>
    <SkillMasteryIndicator skillName={skill.name} mastery={selected ? "None" : skill.mastery} />
    <span className="min-w-0 break-words text-sm text-muted-foreground" title={getSkillMasteryDescription(skill.mastery)}>{skill.name}</span>
  </>;
}

export interface SkillGroupsProps {
  skills: readonly AssignedSkill[];
  categories: readonly SkillCategory[];
  onSkillClick?: (skill: AssignedSkill) => void;
  selectedNames?: readonly string[];
}

export function SkillGroups({ skills, categories, onSkillClick, selectedNames }: SkillGroupsProps) {
  const id = useId();
  const groups = groupSkills(skills, categories);

  return <div className="space-y-8">
    {groups.map((group, index) => (
      <section key={group.id} aria-labelledby={`${id}-${index}`}>
        <h2 id={`${id}-${index}`} className="text-base font-normal text-foreground">{group.name}</h2>
        <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
          {group.skills.map((skill) => (
            <li key={skill.name} className="min-w-0">
              {onSkillClick ? <button
                type="button"
                aria-label={`${selectedNames ? "Select" : "Update"} ${skill.name}`}
                aria-pressed={selectedNames ? selectedNames.includes(skill.name) : undefined}
                onClick={() => onSkillClick(skill)}
                className={cn("flex min-h-10 w-full items-center gap-4 rounded-sm px-4 text-left", primaryFocusRingClassName, !selectedNames?.includes(skill.name) && "hover:bg-sidebar-accent")}
              >
                <SkillItemContent skill={skill} selected={selectedNames?.includes(skill.name)} />
              </button> : <div className="flex min-h-10 items-center gap-4 px-4">
                <SkillItemContent skill={skill} />
              </div>}
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>;
}
