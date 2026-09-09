"use client";

import { useMutation } from "@apollo/client/react";
import { useRef, useState } from "react";

import { useRequestError } from "../../model/useRequestError";
import { getPasswordChangeError, validatePasswordChange, type PasswordChangeValues, type PasswordChangeField, type PasswordChangeErrors } from "./passwordChange";
import { changePasswordMutation, type ChangePasswordData, type ChangePasswordVariables } from "../api/changePasswordMutation";

const initialValues: PasswordChangeValues = { oldPassword: "", password: "", confirmPassword: "" };

interface UsePasswordChangeResult {
  values: PasswordChangeValues;
  touched: Partial<Record<PasswordChangeField, boolean>>;
  errors: PasswordChangeErrors;
  formError?: string;
  success: boolean;
  loading: boolean;
  isValid: boolean;
  updateField: (field: PasswordChangeField, value: string) => void;
  touchField: (field: PasswordChangeField) => void;
  submit: () => Promise<void>;
}

export function usePasswordChange(): UsePasswordChangeResult {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<PasswordChangeField, boolean>>>({});
  const { error: requestErrors, clearError, setError: setRequestErrors } = useRequestError<PasswordChangeErrors & { form?: string }>();
  const [success, setSuccess] = useState(false);
  const inFlight = useRef(false);
  const [execute, { loading }] = useMutation<ChangePasswordData, ChangePasswordVariables>(changePasswordMutation);
  const errors = validatePasswordChange(values);
  const isValid = Object.keys(errors).length === 0;

  function updateField(field: PasswordChangeField, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    clearError();
    setSuccess(false);
  }

  function touchField(field: PasswordChangeField): void {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function submit(): Promise<void> {
    setTouched({ oldPassword: true, password: true, confirmPassword: true });
    if (!isValid || inFlight.current) return;
    inFlight.current = true;
    clearError();
    setSuccess(false);
    try {
      await execute({
        variables: {
          args: {
            oldPassword: values.oldPassword,
            newPassword: values.password,
            confirmPassword: values.confirmPassword,
          },
        },
      });
      setValues(initialValues);
      setTouched({});
      setSuccess(true);
    } catch (error: unknown) {
      setRequestErrors(getPasswordChangeError(error));
    } finally {
      inFlight.current = false;
    }
  }
  return { values, touched, errors: { ...errors, ...requestErrors }, formError: requestErrors?.form, success, loading, isValid, updateField, touchField, submit };
}
