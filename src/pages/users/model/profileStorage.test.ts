import { afterEach, describe, expect, it, vi } from "vitest";

import type { Employee } from "@/entities/employee";

import {
  parseStoredEmployee,
  readStoredEmployee,
  storeEmployee,
} from "./profileStorage";

const employee: Employee = {
  id: "42",
  avatar: null,
  email: "ada@example.com",
  firstName: "Ada",
  lastName: null,
  department: null,
  position: null,
};

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("profileStorage", () => {
  it("restores avatars only for the requested employee", () => {
    storeEmployee(employee);
    expect(parseStoredEmployee(readStoredEmployee("42"), "42")).toEqual(
      employee,
    );
    expect(parseStoredEmployee(readStoredEmployee("42"), "43")).toBeNull();
    expect(parseStoredEmployee("invalid JSON", "42")).toBeNull();
  });

  it("tolerates disabled storage or a full quota", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage disabled");
    });
    expect(() => storeEmployee(employee)).not.toThrow();
    expect(readStoredEmployee("42")).toBeNull();
  });
});
