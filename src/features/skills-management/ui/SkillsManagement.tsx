"use client";

import { SkillActions, SkillGroups, type AssignedSkill, type SkillCategory } from "@/entities/skill";
import { Management } from "@/shared/ui/management";

import type { SkillManagementOperations } from "../model/types";
import { useSkillManagement } from "../model/useSkillManagement";
import { SkillFormDialog } from "./SkillFormDialog";

export interface SkillsManagementProps {
  skills: readonly AssignedSkill[];
  categories: readonly SkillCategory[];
  operations: SkillManagementOperations;
}

export function SkillsManagement({ skills, categories, operations }: SkillsManagementProps) {
  const state = useSkillManagement(skills, operations);
  const count = state.selectedKeys.length;
  return <Management
    empty={!skills.length} emptyMessage="No skills added yet"
    actions={<SkillActions className="mt-8" onAdd={state.add} onRemove={state.startRemoval} removeDisabled={!skills.length} />}
    form={(state.mode.kind === "add" || state.mode.kind === "update") && <SkillFormDialog
      skill={state.mode.kind === "update" ? state.mode.item : undefined}
      assignedSkills={skills} operations={operations} onSaved={state.reset} onClose={state.reset} />}
    removal={{
      active: state.mode.kind === "remove",
      confirming: state.mode.kind === "remove" && state.mode.confirming,
      count, pending: state.removing, error: state.error,
      actionLabel: "DELETE", title: "Remove skills",
      description: <>Are you sure you want to remove <strong className="font-bold">{count} {count > 1 ? "skills" : "skill"}</strong>?</>,
      onCancel: state.reset, onOpenConfirmation: state.openConfirmation,
      onCloseConfirmation: state.closeConfirmation, onConfirm: state.confirmRemove,
    }}
  >
    <SkillGroups skills={skills} categories={categories} onSkillClick={state.clickItem}
      selectedNames={state.mode.kind === "remove" ? state.selectedKeys : undefined} />
  </Management>;
}
