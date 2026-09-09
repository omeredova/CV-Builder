"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useState, type ComponentProps } from "react";
import { cn } from "@/shared/lib/class-names";

export function Calendar({ className, classNames, defaultMonth, month: controlledMonth, onMonthChange, startMonth, endMonth, ...props }: ComponentProps<typeof DayPicker>) {
  const [currentMonth, setCurrentMonth] = useState(defaultMonth ?? new Date());
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [yearPage, setYearPage] = useState(currentMonth.getFullYear() - 3);
  const month = controlledMonth ?? currentMonth;
  const year = month.getFullYear();
  const firstYear = startMonth?.getFullYear() ?? 1900;
  const lastYear = endMonth?.getFullYear() ?? new Date().getFullYear() + 20;
  function selectMonth(date: Date): void {
    const bounded = startMonth && date < new Date(firstYear, startMonth.getMonth()) ? startMonth : endMonth && date > endMonth ? endMonth : date;
    setCurrentMonth(bounded);
    onMonthChange?.(bounded);
    setView("days");
  }
  const previous = new Date(year, month.getMonth() - 1);
  const next = new Date(year, month.getMonth() + 1);
  const buttonClass = "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";
  return <div className={cn("w-80 max-w-full bg-background p-4 text-sm", className)}>
    <div className="mb-3 flex h-7 items-center gap-3">
      <button type="button" aria-label="Choose month" className={cn(buttonClass, view === "months" && "text-primary")} onClick={() => setView(view === "months" ? "days" : "months")}>{month.toLocaleString("en-US", { month: "long" })}</button>
      <button type="button" aria-label="Choose year" className={cn(buttonClass, view === "years" && "text-primary")} onClick={() => { setYearPage(year - 3); setView(view === "years" ? "days" : "years"); }}>{year}</button>
      <div className="ml-auto flex gap-2">
        <button type="button" aria-label={view === "days" ? "Previous month" : "Previous years"} disabled={view === "days" ? !!startMonth && previous < new Date(firstYear, startMonth.getMonth()) : view === "years" ? yearPage <= firstYear : year <= firstYear} className={cn(buttonClass, "flex size-7 items-center justify-center rounded-full border border-border disabled:opacity-30")} onClick={() => view === "years" ? setYearPage(yearPage - 12) : view === "months" ? setCurrentMonth(new Date(year - 1, month.getMonth())) : selectMonth(previous)}><ChevronLeft aria-hidden="true" className="size-4" /></button>
        <button type="button" aria-label={view === "days" ? "Next month" : "Next years"} disabled={view === "days" ? !!endMonth && next > endMonth : view === "years" ? yearPage + 11 >= lastYear : year >= lastYear} className={cn(buttonClass, "flex size-7 items-center justify-center rounded-full border border-border disabled:opacity-30")} onClick={() => view === "years" ? setYearPage(yearPage + 12) : view === "months" ? setCurrentMonth(new Date(year + 1, month.getMonth())) : selectMonth(next)}><ChevronRight aria-hidden="true" className="size-4" /></button>
      </div>
    </div>
    {view === "days" ? <DayPicker {...props} showOutsideDays month={month} onMonthChange={selectMonth} startMonth={startMonth} endMonth={endMonth} hideNavigation captionLayout="label"
      classNames={{
        month_caption: "hidden", month_grid: "w-full border-collapse", weekday: "size-9 text-xs font-normal", day: "size-9 p-0 text-center",
        day_button: "size-9 rounded-full hover:bg-select-hover focus-visible:outline-2 focus-visible:outline-primary",
        selected: "[&>button]:bg-primary [&>button]:text-on-primary", today: "font-semibold [&>button]:border [&>button]:border-primary",
        outside: "text-muted-foreground opacity-40", disabled: "opacity-30", hidden: "invisible", ...classNames,
      }} /> : <div className="grid min-h-60 grid-cols-3 content-center gap-2" aria-label={view === "months" ? "Months" : "Years"}>
        {Array.from({ length: 12 }, (_, index) => {
          const value = view === "months" ? index : yearPage + index;
          const date = new Date(view === "months" ? year : value, view === "months" ? value : month.getMonth());
          const unavailable = view === "months" ? !!startMonth && date < new Date(firstYear, startMonth.getMonth()) || !!endMonth && date > endMonth : value < firstYear || value > lastYear;
          const selected = view === "months" ? value === month.getMonth() : value === year;
          return <button key={value} type="button" disabled={unavailable} aria-pressed={selected} className={cn(buttonClass, "min-h-10 px-1 text-xs hover:bg-select-hover disabled:opacity-30", selected && "bg-primary text-on-primary")} onClick={() => selectMonth(date)}>{view === "months" ? date.toLocaleString("en-US", { month: "long" }) : value}</button>;
        })}
      </div>}
  </div>;
}
