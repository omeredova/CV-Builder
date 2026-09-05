"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/shared/lib/class-names";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  value: string;
  displayValue?: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  onOpen: () => void;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function Select({ label, value, displayValue, options, onValueChange, onOpen, required = false, disabled = false, loading = false, error, className }: SelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef({ text: "", time: 0 });
  const expanded = open && !disabled;
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!expanded) return;
    function closeOutside(event: PointerEvent): void {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  function openMenu(): void {
    setActive(options.findIndex((option) => option.value === value));
    setOpen(true);
    onOpen();
  }

  function moveTo(index: number): void {
    setActive(index);
    document.getElementById(`${id}-option-${index}`)?.scrollIntoView?.({ block: "nearest" });
  }

  function choose(index: number): void {
    const option = options[index];
    if (!option || loading) return;
    onValueChange(option.value);
    setOpen(false);
  }

  return (
    <div ref={root} className={cn("relative max-w-full", className)} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <label id={`${id}-label`} htmlFor={id} className="mb-field-label-gap block pl-field-inline text-xs font-normal text-muted-foreground">{label}</label>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-required={required}
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={expanded ? `${id}-listbox` : undefined}
        aria-activedescendant={expanded && !loading && active >= 0 && options[active] ? `${id}-option-${active}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        className={cn(
          "flex h-control-height w-full items-center justify-between gap-3 border border-border bg-transparent px-field-inline text-left text-foreground outline-none transition-colors enabled:hover:border-muted-foreground focus-visible:border-foreground disabled:cursor-not-allowed disabled:bg-input-disabled-background disabled:text-disabled",
          expanded && "border-muted-foreground",
          error && "border-primary enabled:hover:border-primary focus-visible:border-primary",
        )}
        onClick={() => expanded ? setOpen(false) : openMenu()}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            if (!expanded) { openMenu(); return; }
            if (!options.length || loading) return;
            moveTo(event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 :
              event.key === "ArrowDown" ? (active + 1) % options.length : (active <= 0 ? options.length : active) - 1);
          } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          } else if (expanded && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            choose(active);
          } else if (expanded && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const text = (Date.now() - search.current.time < 700 ? search.current.text : "") + event.key.toLowerCase();
            search.current = { text, time: Date.now() };
            const index = options.findIndex((option) => option.label.toLowerCase().startsWith(text));
            if (index >= 0) moveTo(index);
          }
        }}
      >
        <span className={cn("truncate [font-size:var(--text-input)]", !value && !disabled && "text-placeholder")}>{selected?.label ?? displayValue ?? (value || label)}</span>
        <ChevronDown aria-hidden="true" className={cn("size-5 shrink-0", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className="absolute top-full z-40 w-full border border-t-0 border-muted-foreground bg-background">
          <ul id={`${id}-listbox`} role="listbox" aria-labelledby={`${id}-label`} aria-busy={loading} className="max-h-60 overflow-y-auto">
            {!loading && options.map((option, index) => (
              <li
                id={`${id}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cn("flex min-h-control-height cursor-pointer items-center px-field-inline text-foreground", active === index && "bg-select-hover text-select-hover-foreground", option.value === value && "bg-select-selected text-select-selected-foreground")}
                onPointerMove={() => setActive(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >{option.label}</li>
            ))}
          </ul>
          {error && <p id={`${id}-error`} role="alert" className="px-field-inline py-1 text-xs text-primary">{error}</p>}
          {(loading || !options.length) && <p role="status" className="px-field-inline py-3 text-sm text-muted-foreground">{loading ? "Loading options…" : error ? "Close and reopen to try again." : "No options available"}</p>}
        </div>
      )}
      {error && !expanded && <p id={`${id}-error`} role="alert" className="absolute left-field-inline top-full mt-field-message-top text-xs text-primary">{error}</p>}
    </div>
  );
}
