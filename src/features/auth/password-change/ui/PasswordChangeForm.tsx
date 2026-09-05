"use client";

import { Button } from "@/shared/ui/button";
import { PasswordField } from "@/shared/ui/password-field";
import { PasswordConfirmationFields } from "../../ui/PasswordConfirmationFields";
import { usePasswordChange } from "../model/usePasswordChange";

export function PasswordChangeForm() {
  const form = usePasswordChange();

  return (
    <form noValidate onSubmit={(event) => { event.preventDefault(); void form.submit(); }}>
      <h2 className="mb-6 text-base font-normal">Change password</h2>
      <fieldset disabled={form.loading} className="flex min-w-0 flex-col gap-9">
        <legend className="sr-only">Change password</legend>
        <PasswordField
          id="current-password"
          label="Password"
          placeholder="Password"
          autoComplete="current-password"
          required
          containerClassName="w-full"
          value={form.values.oldPassword}
          onChange={(event) => form.updateField("oldPassword", event.target.value)}
          onBlur={() => form.touchField("oldPassword")}
          error={form.touched.oldPassword ? form.errors.oldPassword : undefined}
        />
        <PasswordConfirmationFields
          passwordId="new-password"
          passwordLabel="New Password"
          passwordPlaceholder="New Password"
          containerClassName="w-full"
          values={form.values}
          errors={form.errors}
          touched={form.touched}
          onChange={form.updateField}
          onBlur={form.touchField}
        />
      </fieldset>
      {form.formError && <p role="alert" className="mt-6 text-sm text-primary">{form.formError}</p>}
      <div className="mt-9 flex justify-end">
        <Button type="submit" className="w-40" disabled={!form.isValid || form.loading} aria-busy={form.loading}>
          {form.loading ? "Changing…" : "Change"}
        </Button>
      </div>
      {form.success && <p role="status" className="mt-6 text-sm">Password changed successfully</p>}
    </form>
  );
}
