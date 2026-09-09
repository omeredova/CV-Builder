import { describe, expect, it } from "vitest";
import { userCreatedAtQuery } from "@/entities/employee";
import { profileSkillsQuery } from "@/entities/skill";
import { profileLanguagesQuery } from "@/entities/language";
import { getEmployeeTabRequest } from "./employeeTabRequest";

describe("employee tab preloading", () => {
  it("loads the membership date for the profile tab", () => {
    expect(getEmployeeTabRequest("alice", "profile")).toEqual({ query: userCreatedAtQuery, variables: { id: "alice" } });
  });
  it("loads only assigned skills and their categories for the skills tab", () => {
    expect(getEmployeeTabRequest("alice", "skills")).toEqual({ query: profileSkillsQuery, variables: { userId: "alice" } });
  });
  it("loads only assigned languages for the languages tab", () => {
    expect(getEmployeeTabRequest("alice", "languages")).toEqual({ query: profileLanguagesQuery, variables: { userId: "alice" } });
  });
});
