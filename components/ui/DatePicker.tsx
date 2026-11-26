"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

type Props = {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  isDisabled?: (date: Date) => boolean;
  min?: Date;
  max?: Date;
  required?: boolean;
  name?: string;
};

const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const pad = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function DatePicker({ label, value, onChange, isDisabled, min, max, required, name }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = value ? fromKey(value) : null;
  // Set when the calendar opens — never read the clock during render (prerender-safe)
  const [focus, setFocusState] = useState<Date | null>(null);
  const [today, setToday] = useState("");
  const setFocus = (next: Date | ((f: Date) => Date)) =>
    setFocusState((f) => (typeof next === "function" ? next(f ?? startOfDay(min ?? new Date(0))) : next));

  const blocked = (d: Date) =>
    (min && d < startOfDay(min)) || (max && d > startOfDay(max)) || (isDisabled?.(d) ?? false);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (open && focus) grid.current?.querySelector<HTMLElement>(`[data-key="${toKey(focus)}"]`)?.focus({ preventScroll: true });
  }, [open, focus]);

  const openPicker = () => {
    const now = new Date();
    setToday(toKey(now));
    let start = selected ?? startOfDay(min ?? now);
    for (let i = 0; i < 60 && blocked(start); i++) start = addDays(start, 1);
    setFocus(start);
    setOpen(true);
  };

  const choose = (d: Date) => {
    if (blocked(d)) return;
    onChange(toKey(d));
    setOpen(false);
  };

  const onGridKey = (e: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in moves) {
      e.preventDefault();
      setFocus((f) => addDays(f, moves[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      setFocus((f) => new Date(f.getFullYear(), f.getMonth() + (e.key === "PageUp" ? -1 : 1), f.getDate()));
    } else if ((e.key === "Enter" || e.key === " ") && focus) {
      e.preventDefault();
      choose(focus);
    } else if (e.key === "Escape") {
      setOpen(false);
      root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  };

  // Monday-first month grid
  const view = focus ? new Date(focus.getFullYear(), focus.getMonth(), 1) : new Date(2026, 0, 1);
  const lead = (view.getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
  ];
  const canPrev = !min || view > startOfDay(min);
  const canNext = !max || new Date(view.getFullYear(), view.getMonth() + 1, 1) <= max;

  const display = selected
    ? selected.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : "Choose a date";

  return (
    <div ref={root} className="relative">
      <span id={`${id}-label`} className="mb-2 block text-[13px] font-extrabold text-ink/70">
        {label}
        {required && <span className="text-seal"> *</span>}
      </span>
      {/* The whole field is the trigger — not just the icon */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => (open ? setOpen(false) : openPicker())}
        onKeyDown={(e) => e.key === "ArrowDown" && (e.preventDefault(), openPicker())}
        data-open={open}
        className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 text-left text-[16px] transition-colors hover:border-ink/30 focus-visible:border-seal focus-visible:outline-none data-[open=true]:border-seal"
      >
        <span className={selected ? "text-ink" : "text-muted/80"}>{display}</span>
        <svg viewBox="0 0 20 20" className="size-[18px] shrink-0 text-muted" aria-hidden>
          <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {name && <input type="hidden" name={name} value={value} required={required} />}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={`${label} calendar`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-[calc(100%+8px)] z-30 origin-top rounded-2xl border border-line bg-paper p-4 shadow-[0_24px_60px_-20px_rgb(35_27_22/0.35)] sm:right-auto sm:w-[340px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canPrev}
                onClick={() => setFocus(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                className="grid size-9 place-items-center rounded-full transition-colors hover:bg-sand disabled:opacity-30"
              >
                <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                  <path d="M12.5 5 7.5 10l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <span className="font-display text-xl" aria-live="polite">
                {view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                aria-label="Next month"
                disabled={!canNext}
                onClick={() => setFocus(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                className="grid size-9 place-items-center rounded-full transition-colors hover:bg-sand disabled:opacity-30"
              >
                <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                  <path d="m7.5 5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-widest text-muted">
              {WEEK.map((d) => (
                <span key={d} className="py-1.5">
                  {d}
                </span>
              ))}
            </div>
            <div ref={grid} role="grid" onKeyDown={onGridKey} className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const key = toKey(d);
                const off = blocked(d);
                const isSel = key === value;
                const isFocus = !!focus && key === toKey(focus);
                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    data-key={key}
                    tabIndex={isFocus ? 0 : -1}
                    aria-disabled={off}
                    aria-selected={isSel}
                    aria-label={d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                    onClick={() => choose(d)}
                    className={`relative grid aspect-square place-items-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-seal ${
                      isSel
                        ? "bg-ink text-cream"
                        : off
                          ? "cursor-not-allowed text-muted/35 line-through decoration-muted/30"
                          : "hover:bg-butter"
                    }`}
                  >
                    {d.getDate()}
                    {key === today && !isSel && <span className="absolute bottom-1 size-1 rounded-full bg-seal" />}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted">Closed on Sundays · Saturdays until 3 pm</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
