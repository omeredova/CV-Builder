import { useApolloClient } from "@apollo/client/react";
import { useRef, useState } from "react";

import {
  fetchEmploymentOptions,
  type Employee, type EmployeeEmployment, type EmploymentUpdate, type EmploymentField, type EmploymentOption,
} from "@/entities/employee";

interface OptionsState {
  items: EmploymentOption[];
  loading: boolean;
  error?: string;
}

type EmploymentDetails = Pick<Employee, EmploymentField | "departmentId" | "positionId">;

interface EmploymentEditState {
  options: Record<EmploymentField, OptionsState>;
  selection: Partial<Record<EmploymentField, EmploymentOption>>;
  saved: EmploymentDetails;
  changed: boolean;
  validationErrors: Record<EmploymentField, string | undefined>;
  loadOptions: (field: EmploymentField) => Promise<void>;
  select: (field: EmploymentField, id: string) => void;
  getInput: () => EmploymentUpdate | undefined;
  acceptSaved: (user: EmployeeEmployment) => EmploymentDetails;
}

export function useEmploymentEdit(employee: Employee, canEdit: boolean): EmploymentEditState {
  const client = useApolloClient();
  const [saved, setSaved] = useState<EmploymentDetails>({ department: employee.department, departmentId: employee.departmentId, position: employee.position, positionId: employee.positionId });
  const [selection, setSelection] = useState<Partial<Record<EmploymentField, EmploymentOption>>>({});
  const [options, setOptions] = useState<Record<EmploymentField, OptionsState>>({
    department: { items: [], loading: false }, position: { items: [], loading: false },
  });
  const pending = useRef(new Set<EmploymentField>());
  const changed = (Object.keys(selection) as EmploymentField[]).some((field) => selection[field]?.id !== saved[`${field}Id`]);

  const validationErrors = {
    department: !(selection.department?.id ?? saved.departmentId) ? "Department is required" : undefined,
    position: !(selection.position?.id ?? saved.positionId) ? "Position is required" : undefined,
  };

  async function loadOptions(field: EmploymentField): Promise<void> {
    if (!canEdit || pending.current.has(field)) return;
    pending.current.add(field);
    setOptions((previous) => ({ ...previous, [field]: { items: [], loading: true } }));
    try {
      const items = await fetchEmploymentOptions(client, field);
      setOptions((previous) => ({ ...previous, [field]: { items, loading: false } }));
    } catch {
      setOptions((previous) => ({ ...previous, [field]: { items: [], loading: false, error: `Unable to load ${field === "department" ? "departments" : "positions"}` } }));
    } finally {
      pending.current.delete(field);
    }
  }

  function select(field: EmploymentField, id: string): void {
    if (!canEdit) return;
    const option = options[field].items.find((item) => item.id === id);
    if (option) setSelection((previous) => ({ ...previous, [field]: option }));
  }

  function getInput(): EmploymentUpdate | undefined {
    if (!canEdit || !changed) return;
    const departmentId = selection.department?.id ?? saved.departmentId;
    const positionId = selection.position?.id ?? saved.positionId;
    if (!departmentId || !positionId) throw new Error("Select a department and position");
    return { userId: employee.id, departmentId, positionId };
  }

  function acceptSaved(user: EmployeeEmployment): EmploymentDetails {
    const updated: EmploymentDetails = {
      department: user.department?.name ?? null,
      departmentId: user.department?.id ?? null,
      position: user.position?.name ?? null,
      positionId: user.position?.id ?? null,
    };
    setSaved(updated);
    setSelection({});
    return updated;
  }

  return { options, selection, saved, changed, validationErrors, loadOptions, select, getInput, acceptSaved };
}
