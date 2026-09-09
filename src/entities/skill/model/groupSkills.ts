import type { AssignedSkill, SkillCategory, SkillGroup } from "./types";

export function groupSkills(skills: readonly AssignedSkill[], categories: readonly SkillCategory[]): SkillGroup[] {
  const categoryMap = new Map<string, SkillCategory>();
  const parentIds = new Map<string, string>();
  function collect(items: readonly SkillCategory[]): void {
    for (const category of items) {
      categoryMap.set(category.id, category);
      if (category.parent) {
        categoryMap.set(category.parent.id, category.parent);
        parentIds.set(category.id, category.parent.id);
      }
      for (const child of category.children ?? []) parentIds.set(child.id, category.id);
      collect(category.children ?? []);
    }
  }
  collect(categories);

  const assigned = new Map<string, AssignedSkill[]>();
  const uncategorized: AssignedSkill[] = [];
  for (const skill of skills) {
    if (skill.categoryId === null || !categoryMap.has(skill.categoryId)) {
      uncategorized.push(skill);
      continue;
    }
    let categoryId = skill.categoryId;
    const visited = new Set<string>();
    while (parentIds.has(categoryId) && !visited.has(categoryId)) {
      visited.add(categoryId);
      const parentId = parentIds.get(categoryId);
      if (!parentId || !categoryMap.has(parentId)) break;
      categoryId = parentId;
    }
    const group = assigned.get(categoryId) ?? [];
    group.push(skill);
    assigned.set(categoryId, group);
  }

  const groups = [...categoryMap.values()]
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .flatMap((category) => {
      const items = assigned.get(category.id);
      return items ? [{ id: category.id, name: category.name, skills: items }] : [];
    });
  if (uncategorized.length) groups.push({ id: "uncategorized", name: "Other skills", skills: uncategorized });
  return groups;
}
