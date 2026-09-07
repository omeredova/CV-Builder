"use client";

import { LanguageActions, LanguageList, type AssignedLanguage } from "@/entities/language";
import { Management } from "@/shared/ui/management";

import type { LanguageManagementOperations } from "../model/types";
import { useLanguageManagement } from "../model/useLanguageManagement";
import { LanguageFormDialog } from "./LanguageFormDialog";

export interface LanguagesManagementProps {
  languages: readonly AssignedLanguage[];
  operations: LanguageManagementOperations;
}

export function LanguagesManagement({ languages, operations }: LanguagesManagementProps) {
  const state = useLanguageManagement(languages, operations);
  const count = state.selectedKeys.length;
  return <Management
    empty={!languages.length} emptyMessage="No languages added yet"
    actions={<LanguageActions className="mt-8" onAdd={state.add} onRemove={state.startRemoval} removeDisabled={!languages.length} />}
    form={(state.mode.kind === "add" || state.mode.kind === "update") && <LanguageFormDialog
      language={state.mode.kind === "update" ? state.mode.item : undefined}
      assignedLanguages={languages} operations={operations} onSaved={state.reset} onClose={state.reset} />}
    removal={{
      active: state.mode.kind === "remove",
      confirming: state.mode.kind === "remove" && state.mode.confirming,
      count, pending: state.removing, error: state.error,
      actionLabel: "REMOVE", title: "Remove languages",
      description: <>Are you sure you want to remove <strong className="font-bold">{count} {count > 1 ? "languages" : "language"}</strong>?</>,
      onCancel: state.reset, onOpenConfirmation: state.openConfirmation,
      onCloseConfirmation: state.closeConfirmation, onConfirm: state.confirmRemove,
    }}
  >
    <LanguageList languages={languages} onLanguageClick={state.clickItem}
      selectedNames={state.mode.kind === "remove" ? state.selectedKeys : undefined} />
  </Management>;
}
