import type { CvValues } from "@/entities/cv";

export function validateCv(values: CvValues): Partial<Record<keyof CvValues, string>> {
  const errors: Partial<Record<keyof CvValues, string>> = {};
  for (const field of ["name", "education", "description"] as const) {
    const label = field[0].toUpperCase() + field.slice(1);
    if (!values[field].trim()) errors[field] = `${label} is required`;
    else if (field !== "description" && values[field].length > 255) errors[field] = `${label} must be at most 255 characters`;
  }
  return errors;
}
