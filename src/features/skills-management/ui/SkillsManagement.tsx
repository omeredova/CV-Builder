"use client";

import { SkillActions, SkillGroups, type AssignedSkill, type SkillCategory } from "@/entities/skill";
import { Button } from "@/shared/ui/button";
import { DialogFooter } from "@/shared/ui/dialog";
import { Modal } from "@/shared/ui/modal";

import type { SkillManagementOperations } from "../model/types";
import { useSkillManagement } from "../model/useSkillManagement";
import { SkillFormDialog } from "./SkillFormDialog";

export interface SkillsManagementProps {
  skills: readonly AssignedSkill[];
  categories: readonly SkillCategory[];
  operations: SkillManagementOperations;
}

/** Entity-agnostic persistence: callers provide profile or CV operations. */
export function SkillsManagement({ skills, categories, operations }: SkillsManagementProps) {
  const state = useSkillManagement(skills, operations);
  const count = state.selectedNames.length;
  return <>
    {skills.length ? <SkillGroups skills={skills} categories={categories} onSkillClick={state.clickSkill}
      selectedNames={state.mode.kind === "remove" ? state.selectedNames : undefined} /> :
      <p className="py-8 text-center text-base">No skills added yet</p>}
    {state.mode.kind === "remove" ? <div className="mt-8 flex flex-wrap justify-end gap-6">
      <Button type="button" variant="secondary" onClick={state.reset} disabled={state.removing}>CANCEL</Button>
      <Button type="button" className="gap-4" aria-label={`DELETE (${state.selectedNames.length})`} onClick={state.openConfirmation} disabled={!state.selectedNames.length || state.removing}>
        DELETE
        {state.selectedNames.length > 0 && <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-on-primary text-xs leading-none font-medium text-primary">{state.selectedNames.length}</span>}
      </Button>
    </div> : <SkillActions className="mt-8" onAdd={state.add} onRemove={state.startRemoval} removeDisabled={!skills.length} />}
    {state.mode.kind === "remove" && !state.mode.confirming && state.error && <p role="alert" className="mt-4 text-sm text-primary">{state.error}</p>}
    {(state.mode.kind === "add" || state.mode.kind === "update") && <SkillFormDialog
      skill={state.mode.kind === "update" ? state.mode.skill : undefined}
      assignedSkills={skills} operations={operations} onSaved={state.reset} onClose={state.reset} />}
    {state.mode.kind === "remove" && state.mode.confirming && <Modal title="Remove skills"
      description={<>Are you sure you want to remove <strong className="font-bold">{count} {count > 1 ? "skills" : "skill"}</strong>?</>}
      onClose={state.closeConfirmation}>
      {state.error && <p role="alert" className="text-sm text-primary">{state.error}</p>}
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={state.closeConfirmation}>CANCEL</Button>
        <Button type="button" disabled={state.removing || !state.selectedNames.length} aria-busy={state.removing} onClick={() => { void state.confirmRemove(); }}>{state.removing ? "REMOVING…" : "CONFIRM"}</Button>
      </DialogFooter>
    </Modal>}
  </>;
}
