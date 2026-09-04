import type { Employee } from "@/entities/employee";

const storedEmployeeKeyPrefix = "cv-builder:user-profile:";

export function parseStoredEmployee(
  value: string | null,
  userId: string,
): Employee | null {
  if (!value) {
    return null;
  }

  try {
    const employee: unknown = JSON.parse(value);
    if (isEmployee(employee) && employee.id === userId) return employee;
  } catch {
    return null;
  }

  return null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isEmployee(value: unknown): value is Employee {
  if (typeof value !== "object" || value === null) return false;

  const employee = value as Record<string, unknown>;
  return (
    typeof employee.id === "string" &&
    typeof employee.email === "string" &&
    isNullableString(employee.avatar) &&
    isNullableString(employee.department) &&
    isNullableString(employee.firstName) &&
    isNullableString(employee.lastName) &&
    isNullableString(employee.position)
  );
}

export function readStoredEmployee(userId: string): string | null {
  try {
    return sessionStorage.getItem(`${storedEmployeeKeyPrefix}${userId}`);
  } catch {
    return null;
  }
}

export function storeEmployee(employee: Employee): void {
  try {
    sessionStorage.setItem(
      `${storedEmployeeKeyPrefix}${employee.id}`,
      JSON.stringify(employee),
    );
  } catch {
    // The server and Apollo cache remain authoritative when browser storage is unavailable.
  }
}
