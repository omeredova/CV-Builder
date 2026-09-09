"use client";

import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import { Calendar } from "./calendar";
import { FormField } from "./form-field";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}
function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
export function DatePicker({ label, value, onValueChange, onBlur, min, max, disabled, required, error }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const selected = toDate(value);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverAnchor asChild><div className="relative">
      <FormField id={id} label={label} labelPlacement="above" type="date" containerClassName="w-full" className="pr-12 [&::-webkit-calendar-picker-indicator]:hidden" value={value} min={min} max={max} disabled={disabled} required={required} error={error} onBlur={onBlur} onChange={(event) => onValueChange(event.target.value)} />
      <PopoverTrigger asChild><button type="button" aria-label={`Choose ${label.toLowerCase()}`} disabled={disabled} className="absolute bottom-0 right-3 flex h-control-height items-center text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"><CalendarIcon aria-hidden="true" className="size-5" /></button></PopoverTrigger>
    </div></PopoverAnchor>
    <PopoverContent onEscapeKeyDown={(event) => event.stopPropagation()}>
      <Calendar mode="single" captionLayout="dropdown" selected={selected} defaultMonth={selected ?? toDate(min)} startMonth={toDate(min) ?? new Date(1970, 0)} endMonth={toDate(max) ?? new Date(new Date().getFullYear() + 20, 11)} disabled={[...(min ? [{ before: toDate(min)! }] : []), ...(max ? [{ after: toDate(max)! }] : [])]} onSelect={(date) => {
        onValueChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "");
        setOpen(false);
      }} autoFocus />
    </PopoverContent>
  </Popover>;
}
