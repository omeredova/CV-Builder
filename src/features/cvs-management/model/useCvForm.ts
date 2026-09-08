"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { createCvMutation, updateCvMutation, type Cv, type CvValues } from "@/entities/cv";
import { validateCv } from "./validation";

export interface CvFormState {
  values: CvValues;
  errors: Partial<Record<keyof CvValues, string>>;
  touched: Partial<Record<keyof CvValues, boolean>>;
  loading: boolean;
  valid: boolean;
  dirty: boolean;
  error?: string;
  saved: boolean;
  change: (field: keyof CvValues, value: string) => void;
  blur: (field: keyof CvValues) => void;
  submit: () => Promise<void>;
}

export function useCvForm(cv: Cv | undefined, userId: string, onSaved?: () => void): CvFormState {
  const initial = { name: cv?.name ?? "", education: cv?.education ?? "", description: cv?.description ?? "" };
  const [values, setValues] = useState<CvValues>(initial);
  const [baseline, setBaseline] = useState<CvValues>(initial);
  const [touched, setTouched] = useState<CvFormState["touched"]>({});
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [save, { loading }] = useMutation(cv ? updateCvMutation : createCvMutation);
  const errors = validateCv(values);
  const valid = Object.keys(errors).length === 0;
  const dirty = (Object.keys(values) as (keyof CvValues)[]).some((field) => values[field] !== baseline[field]);

  async function submit(): Promise<void> {
    if (loading || !valid) return;
    setError(undefined);
    const trimmed = { name: values.name.trim(), education: values.education.trim(), description: values.description.trim() };
    try {
      await save({ variables: { cv: { ...trimmed, ...(cv ? { cvId: cv.id } : { userId }) } } });
      setValues(trimmed);
      setBaseline(trimmed);
      setSaved(true);
      onSaved?.();
    } catch { setError(`Failed to ${cv ? "update" : "create"} CV. Please try again.`); }
  }
  return {
    values, errors, touched, loading, valid, dirty, error, saved, submit,
    change(field, value) { setValues((current) => ({ ...current, [field]: value })); setSaved(false); },
    blur(field) { setTouched((current) => ({ ...current, [field]: true })); },
  };
}
