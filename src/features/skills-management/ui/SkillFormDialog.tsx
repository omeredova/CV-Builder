import { skillMasteryOptions } from "@/entities/skill";
import { Button } from "@/shared/ui/button";
import { DialogFooter } from "@/shared/ui/dialog";
import { Modal } from "@/shared/ui/modal";
import { Select } from "@/shared/ui/select";

import { useSkillForm, type SkillFormOptions } from "../model/useSkillForm";

export interface SkillFormDialogProps extends SkillFormOptions {
  onClose: () => void;
}

export function SkillFormDialog({ onClose, ...props }: SkillFormDialogProps) {
  const form = useSkillForm(props);
  return <Modal title={props.skill ? "Update skill" : "Add skill"} onClose={onClose}>
    <form noValidate onSubmit={(event) => { event.preventDefault(); void form.submit(); }} aria-busy={form.saving}>
      <div className="space-y-9">
        <Select label="Skill" labelPlacement="floating" required value={form.name} options={form.options} onValueChange={form.setName}
          onOpen={() => { void form.loadOptions(); }} disabled={Boolean(props.skill) || form.saving}
          loading={form.loadingOptions} error={form.skillError} loadError={form.optionsError}
          hasMore={form.hasMoreOptions} onLoadMore={() => { void form.loadMoreOptions(); }} />
        <Select label="Skill mastery" labelPlacement="floating" required value={form.mastery} options={skillMasteryOptions}
          onValueChange={form.setMastery} disabled={form.saving} error={form.masteryError} />
      </div>
      {form.error && <p role="alert" className="mt-8 text-sm text-primary">{form.error}</p>}
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>CANCEL</Button>
        <Button type="submit" disabled={form.saving || form.loadingOptions}>{form.saving ? "SAVING…" : props.skill ? "SAVE" : "ADD"}</Button>
      </DialogFooter>
    </form>
  </Modal>;
}
