import { describe, expect, it } from "vitest";

import { groupSkills } from "./groupSkills";

describe("groupSkills", () => {
  it("combines nested and flat subcategories under their parent without changing skill order", () => {
    const skills = [
      { name: "React", categoryId: "frameworks", mastery: "Expert" as const },
      { name: "CSS", categoryId: "frontend", mastery: "Proficient" as const },
      { name: "Redux", categoryId: "state", mastery: "Competent" as const },
    ];
    expect(groupSkills(skills, [
      { id: "frontend", name: "Frontend", order: 1, children: [{ id: "frameworks", name: "Frameworks", order: 1 }] },
      { id: "state", name: "State", order: 2, parent: { id: "frameworks", name: "Frameworks", order: 1 } },
      { id: "frameworks", name: "Frameworks", order: 1, parent: { id: "frontend", name: "Frontend", order: 1 } },
      { id: "empty", name: "Empty", order: 0 },
    ])).toEqual([{ id: "frontend", name: "Frontend", skills }]);
  });

  it("preserves skills with missing or unknown category IDs", () => {
    const skills = [
      { name: "SQL", categoryId: null, mastery: "Advanced" as const },
      { name: "Git", categoryId: "removed-category", mastery: "Novice" as const },
    ];
    expect(groupSkills(skills, [])).toEqual([{ id: "uncategorized", name: "Other skills", skills }]);
    expect(groupSkills([], [{ id: "empty", name: "Empty", order: 0 }])).toEqual([]);
  });
});
