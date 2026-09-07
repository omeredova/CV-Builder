import { languageProficiencyOptions } from "@/entities/language";
import { ManagementFormDialog } from "@/shared/ui/management-form-dialog";
import { Select } from "@/shared/ui/select";

import { useLanguageForm, type LanguageFormOptions } from "../model/useLanguageForm";

export interface LanguageFormDialogProps extends LanguageFormOptions {
  onClose: () => void;
}

export function LanguageFormDialog({ onClose, ...props }: LanguageFormDialogProps) {
  const form = useLanguageForm(props);
  return <ManagementFormDialog title={props.language ? "Update language" : "Add language"} onClose={onClose}
    submitLabel={props.language ? "SAVE" : "ADD"} saving={form.saving} error={form.error}
    submitDisabled={form.loadingOptions || !form.valid} onSubmit={form.submit}>
    <div onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) form.touch("language"); }}>
      <Select label="Language" labelPlacement="floating" required value={form.name} options={form.options} onValueChange={form.setName}
        onOpen={() => { void form.loadOptions(); }} disabled={Boolean(props.language) || form.saving}
        loading={form.loadingOptions} error={form.languageError} loadError={form.optionsError}
        hasMore={form.hasMoreOptions} onLoadMore={() => { void form.loadMoreOptions(); }} />
    </div>
    <div onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) form.touch("proficiency"); }}>
      <Select label="Language proficiency" labelPlacement="floating" required value={form.proficiency} options={languageProficiencyOptions}
        onValueChange={form.setProficiency} disabled={form.saving} error={form.proficiencyError} />
    </div>
  </ManagementFormDialog>;
}
