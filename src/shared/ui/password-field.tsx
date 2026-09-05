"use client";

import { forwardRef, useState } from "react";

import { FormField, type FormFieldProps } from "./form-field";

export type PasswordFieldProps = Omit<
  FormFieldProps,
  "type" | "passwordIcon" | "passwordVisible" | "onPasswordVisibilityToggle"
>;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <FormField
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        passwordIcon
        passwordVisible={visible}
        onPasswordVisibilityToggle={() => setVisible((current) => !current)}
      />
    );
  },
);

PasswordField.displayName = "PasswordField";
