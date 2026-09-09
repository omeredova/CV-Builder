"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/shared/lib/class-names";
import { Button } from "./button";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  labelPlacement?: "above" | "floating";
  value: string;
  displayValue?: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  onOpen?: () => void;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadError?: string;
  error?: string;
  className?: string;
}

export function Select({ label, labelPlacement = "above", value, displayValue, options, onValueChange, onOpen, required = false, disabled = false, loading = false, hasMore = false, onLoadMore, loadError, error, className }: SelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const control = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (expanded && active >= 0) {
      document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: "nearest" });
    }
  }, [active, expanded, id]);

  function loadMore(): void {
    if (hasMore && !loading) onLoadMore?.();
  }

  function openMenu(index?: number): void {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActive(index ?? (selectedIndex >= 0 ? selectedIndex : options.length ? 0 : -1));
    search.current = { text: "", time: 0 };
    setOpen(true);
    onOpen?.();
  }

  function moveTo(index: number): void {
    setActive(index);
  }

  function choose(index: number): void {
    const option = options[index];
    if (!option) return;
    onValueChange(option.value);
    setOpen(false);
  }

  return (
    <div ref={root} className={cn("relative max-w-full", className)} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        control.current?.focus();
      }
    }}>
      <label id={`${id}-label`} htmlFor={id} className={cn("mb-field-label-gap block pl-field-inline text-xs font-normal text-muted-foreground", labelPlacement === "floating" && "absolute bottom-full", labelPlacement === "floating" && !value && !expanded && !error && "sr-only")}>{label}</label>
      <button
        ref={control}
        type="button"
        id={id}
        role="combobox"
        aria-required={required}
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={expanded ? `${id}-listbox` : undefined}
        aria-activedescendant={expanded && active >= 0 && options[active] ? `${id}-option-${active}` : undefined}
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
            const last = options.length - 1;
            if (!expanded) {
              openMenu(event.key === "Home" ? 0 : event.key === "End" ? last : undefined);
              return;
            }
            if (!options.length) {
              if (event.key === "ArrowDown" || event.key === "End") loadMore();
              return;
            }
            if (event.key === "End" || (event.key === "ArrowDown" && active === last)) loadMore();
            moveTo(event.key === "Home" ? 0 : event.key === "End" ? last :
              event.key === "ArrowDown" ? Math.min(active + 1, last) : Math.max(active - 1, 0));
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (expanded) choose(active);
            else openMenu();
          } else if (event.key === "Tab") {
            if (expanded && !onLoadMore) choose(active);
          } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            if (!options.length) return;
            const previous = expanded && Date.now() - search.current.time < 700 ? search.current.text : "";
            const text = previous + event.key.toLowerCase();
            const repeated = [...text].every((character) => character === text[0]);
            const prefix = repeated ? text[0] : text;
            const start = expanded ? active : options.findIndex((option) => option.value === value);
            const ordered = options.map((_, index) => (start + (repeated ? 1 : 0) + index + options.length) % options.length);
            const index = ordered.find((index) => options[index].label.toLowerCase().startsWith(prefix));
            if (!expanded) openMenu(index);
            else if (index !== undefined) moveTo(index);
            search.current = { text, time: Date.now() };
          }
        }}
      >
        <span className={cn("truncate [font-size:var(--text-input)]", !value && !disabled && "text-placeholder")}>{selected?.label ?? displayValue ?? (value || label)}</span>
        <ChevronDown aria-hidden="true" className={cn("size-5 shrink-0", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className="absolute top-full z-40 w-full border border-t-0 border-muted-foreground bg-background">
          <ul id={`${id}-listbox`} role="listbox" aria-labelledby={`${id}-label`} aria-busy={loading} className="max-h-60 overflow-y-auto"
            onScroll={(event) => {
              const list = event.currentTarget;
              if (!loadError && list.scrollHeight > list.clientHeight && Math.ceil(list.scrollTop + list.clientHeight) >= list.scrollHeight) loadMore();
            }}>
            {options.map((option, index) => (
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
          {loadError && <p role="alert" className="px-field-inline py-1 text-xs text-primary">{loadError}</p>}
          {(loading || !options.length) && <p role="status" className="px-field-inline py-3 text-sm text-muted-foreground">{loading ? "Loading options…" : loadError || error ? "Close and reopen to try again." : hasMore ? "No available options on this page." : "No options available"}</p>}
          {hasMore && onLoadMore && <Button type="button" variant="link" disabled={loading} className="w-full px-field-inline text-muted-foreground"
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => { control.current?.focus(); loadMore(); }}>{loadError ? "Retry loading options" : "Load more options"}</Button>}
        </div>
      )}
      {error && !expanded && <p id={`${id}-error`} role="alert" className="absolute left-field-inline top-full mt-field-message-top text-xs text-primary">{error}</p>}
    </div>
  );
}
