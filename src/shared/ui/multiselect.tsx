"use client";

import { defaultFilter } from "cmdk";
import { Check, ChevronDown, X } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/shared/lib/class-names";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
import type { SelectOption } from "./select";

export interface MultiselectProps {
  label: string;
  value: readonly string[];
  options: readonly SelectOption[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function Multiselect({ label, value, options, onValueChange, disabled, required, error }: MultiselectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  function toggle(item: string): void {
    onValueChange(value.includes(item) ? value.filter((entry) => entry !== item) : [...value, item]);
  }
  return <div>
    <label htmlFor={id} className="mb-field-label-gap block pl-field-inline text-xs text-muted-foreground">{label}</label>
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverAnchor asChild><div className={cn("relative flex min-h-control-height items-center gap-2 border border-border px-field-inline", disabled && "bg-input-disabled-background text-disabled", error && "border-primary")}>
        <div className="flex flex-1 flex-wrap gap-1 py-2">
          {value.map((item) => <span key={item} className="inline-flex max-w-full items-center gap-1 rounded-control border border-current px-2 text-xs">
            <span className="break-words">{options.find((option) => option.value === item)?.label ?? item}</span>
            {!disabled && <button type="button" aria-label={`Remove ${item}`} className="relative z-10 rounded-full focus-visible:outline-2 focus-visible:outline-primary" onClick={() => toggle(item)}><X aria-hidden="true" className="size-3" /></button>}
          </span>)}
          {!value.length && <span className="text-placeholder">{label}</span>}
        </div>
        <PopoverTrigger asChild><button id={id} type="button" role="combobox" aria-label={label} aria-expanded={open && !disabled} aria-haspopup="dialog" aria-controls={open ? `${id}-options` : undefined} aria-required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} disabled={disabled} className="absolute inset-0 flex items-center justify-end px-field-inline outline-none focus-visible:ring-2 focus-visible:ring-primary"><ChevronDown aria-hidden="true" className={cn("size-5", open && "rotate-180")} /></button></PopoverTrigger>
      </div></PopoverAnchor>
      <PopoverContent id={`${id}-options`} className="w-[var(--radix-popover-trigger-width)] min-w-72" onEscapeKeyDown={(event) => event.stopPropagation()}>
        <MultiselectOptions label={label} value={value} options={options} onToggle={toggle} />
      </PopoverContent>
    </Popover>
    {error && <p id={`${id}-error`} role="alert" className="mt-field-message-top pl-field-inline text-xs text-primary">{error}</p>}
  </div>;
}

interface MultiselectOptionsProps {
  label: string;
  value: readonly string[];
  options: readonly SelectOption[];
  onToggle: (value: string) => void;
}

function MultiselectOptions({ label, value, options, onToggle }: MultiselectOptionsProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const filteredOptions = options
    .map((option) => ({ option, score: defaultFilter(option.label, debouncedSearch) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ option }) => option);

  return (
    <Command label={`Search ${label.toLowerCase()}`} shouldFilter={false}><CommandInput aria-label={`Search ${label.toLowerCase()}`} placeholder="Search" value={search} onValueChange={setSearch} />
      <CommandList aria-multiselectable="true"><CommandEmpty>No options found</CommandEmpty>
        {filteredOptions.map((option) => <CommandItem key={option.value} value={option.label} aria-checked={value.includes(option.value)} onSelect={() => onToggle(option.value)}>
          <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center border border-current">{value.includes(option.value) && <Check className="size-3" />}</span>
          {option.label}<span className="sr-only">{value.includes(option.value) ? ", selected" : ", not selected"}</span>
        </CommandItem>)}
      </CommandList>
    </Command>
  );
}
