import { useId } from "react";

import { groupSkills } from "../model/groupSkills";
import { getSkillMasteryDescription } from "../model/mastery";
import type { AssignedSkill, SkillCategory } from "../model/types";
import { SkillMasteryIndicator } from "./SkillMasteryIndicator";

export interface SkillGroupsProps {
  skills: readonly AssignedSkill[];
  categories: readonly SkillCategory[];
}

export function SkillGroups({ skills, categories }: SkillGroupsProps) {
  const id = useId();
  const groups = groupSkills(skills, categories);

  return <div className="space-y-8">
    {groups.map((group, index) => (
      <section key={group.id} aria-labelledby={`${id}-${index}`}>
        <h2 id={`${id}-${index}`} className="text-base font-normal text-foreground">{group.name}</h2>
        <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
          {group.skills.map((skill) => (
            <li key={skill.name} className="flex min-h-10 min-w-0 items-center gap-4 px-4">
              <SkillMasteryIndicator skillName={skill.name} mastery={skill.mastery} />
              <span className="min-w-0 break-words text-sm text-skill-name" title={getSkillMasteryDescription(skill.mastery)}>
                {skill.name}
              </span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>;
}
