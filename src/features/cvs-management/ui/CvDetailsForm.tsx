"use client";

import type { Cv } from "@/entities/cv";
import { Button } from "@/shared/ui/button";
import { useCvForm } from "../model/useCvForm";
import { CvFormFields } from "./CvFormFields";

export function CvDetailsForm({ cv }: { cv: Cv }) {
  const form = useCvForm(cv, cv.user?.id ?? "");
  return <form aria-label="CV details" noValidate aria-busy={form.loading}
    className="space-y-6" onSubmit={(event) => { event.preventDefault(); void form.submit(); }}>
    <CvFormFields form={form} labelPlacement="above" />
    {form.error && <p role="alert" className="text-sm text-primary">{form.error}</p>}
    {form.saved && <p role="status" className="text-sm text-muted-foreground">CV updated</p>}
    <div className="flex justify-end pt-3">
      <Button type="submit" disabled={form.loading || !form.valid || !form.dirty}>{form.loading ? "UPDATING…" : "UPDATE"}</Button>
    </div>
  </form>;
}
