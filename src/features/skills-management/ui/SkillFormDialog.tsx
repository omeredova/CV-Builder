import { skillMasteryOptions } from "@/entities/skill";
import { ManagementFormDialog } from "@/shared/ui/management-form-dialog";
import { Select } from "@/shared/ui/select";

import { useSkillForm, type SkillFormOptions } from "../model/useSkillForm";

export interface SkillFormDialogProps extends SkillFormOptions {
  onClose: () => void;
}

export function SkillFormDialog({ onClose, ...props }: SkillFormDialogProps) {
  const form = useSkillForm(props);
  return <ManagementFormDialog title={props.skill ? "Update skill" : "Add skill"} onClose={onClose}
    submitLabel={props.skill ? "SAVE" : "ADD"} saving={form.saving} error={form.error}
    submitDisabled={form.loadingOptions} onSubmit={form.submit}>
    <Select label="Skill" labelPlacement="floating" required value={form.name} options={form.options} onValueChange={form.setName}
      onOpen={() => { void form.loadOptions(); }} disabled={Boolean(props.skill) || form.saving}
      loading={form.loadingOptions} error={form.skillError} loadError={form.optionsError}
      hasMore={form.hasMoreOptions} onLoadMore={() => { void form.loadMoreOptions(); }} />
    <Select label="Skill mastery" labelPlacement="floating" required value={form.mastery} options={skillMasteryOptions}
      onValueChange={form.setMastery} disabled={form.saving} error={form.masteryError} />
  </ManagementFormDialog>;
}
