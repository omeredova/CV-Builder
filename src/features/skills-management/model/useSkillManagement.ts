import { useRef, useState } from "react";

import type { AssignedSkill } from "@/entities/skill";

import type { SkillManagementOperations } from "./types";

type ManagementMode = { kind: "view" } | { kind: "add" } | { kind: "update"; skill: AssignedSkill } | { kind: "remove"; confirming: boolean };

export function useSkillManagement(skills: readonly AssignedSkill[], operations: SkillManagementOperations) {
  const [mode, setMode] = useState<ManagementMode>({ kind: "view" });
  const [selection, setSelection] = useState<readonly string[]>([]);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);
  const selectedNames = selection.filter((name) => skills.some((skill) => skill.name === name));

  function reset(): void {
    setMode({ kind: "view" });
    setSelection([]);
    setError(undefined);
  }

  async function confirmRemove(): Promise<void> {
    if (mode.kind !== "remove" || !mode.confirming || !selectedNames.length || pending.current) return;
    pending.current = true;
    setRemoving(true);
    setError(undefined);
    try { await operations.removeSkills(selectedNames); reset(); }
    catch { setError("Failed to remove skills. Please try again."); }
    finally { pending.current = false; setRemoving(false); }
  }

  return {
    mode, selectedNames, removing, error, reset, confirmRemove,
    add() { setMode({ kind: "add" }); },
    startRemoval() { setSelection([]); setMode({ kind: "remove", confirming: false }); },
    openConfirmation() { if (selectedNames.length) { setError(undefined); setMode({ kind: "remove", confirming: true }); } },
    closeConfirmation() { setMode({ kind: "remove", confirming: false }); },
    clickSkill(skill: AssignedSkill) {
      if (pending.current) return;
      if (mode.kind === "remove") setSelection((previous) => previous.includes(skill.name) ? previous.filter((name) => name !== skill.name) : [...previous, skill.name]);
      else setMode({ kind: "update", skill });
    },
  };
}
