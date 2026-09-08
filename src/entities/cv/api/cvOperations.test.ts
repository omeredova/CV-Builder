import { print } from "graphql";
import { describe, expect, it } from "vitest";
import { cvsQuery, cvQuery, cvSkillsQuery, cvHeaderQuery, createCvMutation, updateCvMutation } from "./cvOperations";

describe("CV query field boundaries", () => {
  it.each([cvQuery, cvSkillsQuery, cvHeaderQuery, createCvMutation, updateCvMutation])("does not request the owner's email", (operation) => {
    expect(print(operation)).not.toMatch(/\bemail\b/);
  });

  it("requests only table fields for each user-filtered list item", () => {
    const query = print(cvsQuery);
    expect(query).toContain("cvsByUserId(userId: $userId, params: $params)");
    expect(query).toMatch(/items\s*\{\s*id\s+name\s+education\s*\}/);
    expect(query).not.toMatch(/\b(description|skills|user)\b/);
  });

  it("loads description without skills for details", () => {
    const query = print(cvQuery);
    expect(query).toContain("cv(cvId: $cvId)");
    expect(query).toContain("description");
    expect(query).not.toMatch(/\bskills\b/);
  });

  it("loads skills without description for the Skills tab", () => {
    const query = print(cvSkillsQuery);
    expect(query).toContain("cv(cvId: $cvId)");
    expect(query).toContain("skills {");
    expect(query).not.toMatch(/\b(description|education)\b/);
  });
});
