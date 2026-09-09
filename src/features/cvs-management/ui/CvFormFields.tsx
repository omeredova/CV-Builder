import { useId } from "react";
import { FormField } from "@/shared/ui/form-field";
import { Textarea } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { CvFormState } from "../model/useCvForm";

interface CvFormFieldsProps { form: CvFormState; labelPlacement?: "floating" | "above" }
export function CvFormFields({ form, labelPlacement = "floating" }: CvFormFieldsProps) {
  const id = useId();
  const descriptionError = form.touched.description ? form.errors.description : undefined;
  return <>
    {(["name", "education"] as const).map((field) => <FormField
      key={field} label={field === "name" ? "Name" : "Education"}
      placeholder={field === "name" ? "Name" : "Education"} labelPlacement={labelPlacement}
      containerClassName="w-full" required maxLength={255} disabled={form.loading}
      value={form.values[field]} error={form.touched[field] ? form.errors[field] : undefined}
      onBlur={() => form.blur(field)} onChange={(event) => form.change(field, event.target.value)}
    />)}
    <div className="relative">
      <Label htmlFor={id} className="mb-field-label-gap block pl-field-inline text-xs font-normal text-muted-foreground">Description</Label>
      <Textarea id={id} placeholder="Description" className="h-cv-description" required disabled={form.loading}
        value={form.values.description} aria-invalid={!!descriptionError}
        aria-describedby={descriptionError ? `${id}-error` : undefined} variant={descriptionError ? "invalid" : "default"}
        onBlur={() => form.blur("description")} onChange={(event) => form.change("description", event.target.value)} />
      {descriptionError && <p id={`${id}-error`} role="alert" className="mt-field-message-top pl-field-inline text-xs text-primary">{descriptionError}</p>}
    </div>
  </>;
}
