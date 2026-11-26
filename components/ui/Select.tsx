"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type Option = { value: string; label: string; hint?: string; disabled?: boolean };

type Props = {
  label: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

export function Select({ label, placeholder = "Select", options, value, onChange, name, required, disabled }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  const move = (dir: 1 | -1) => {
    const pos = enabled.indexOf(active);
    setActive(enabled[(pos + dir + enabled.length) % enabled.length] ?? 0);
  };
  const pick = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange(o.value);
    setOpen(false);
  };
  const openList = () => {
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : (enabled[0] ?? 0));
    setOpen(true);
  };

  const onKey = (e: KeyboardEvent) => {
    if (disabled) return;
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") (e.preventDefault(), move(1));
    else if (e.key === "ArrowUp") (e.preventDefault(), move(-1));
    else if (e.key === "Home") (e.preventDefault(), setActive(enabled[0] ?? 0));
    else if (e.key === "End") (e.preventDefault(), setActive(enabled.at(-1) ?? 0));
    else if (e.key === "Enter" || e.key === " ") (e.preventDefault(), pick(active));
    else if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} className="relative">
      <span id={`${id}-label`} className="mb-2 block text-[13px] font-extrabold text-ink/70">
        {label}
        {required && <span className="text-seal"> *</span>}
      </span>
      <button
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        className="group flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 text-left text-[16px] transition-colors hover:border-ink/30 focus-visible:border-seal focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[open=true]:border-seal"
        data-open={open}
      >
        <span className={selected ? "text-ink" : "text-muted/80"}>{selected?.label ?? placeholder}</span>
        <svg
          viewBox="0 0 20 20"
          className={`size-4 shrink-0 text-muted transition-transform duration-500 ease-[var(--ease-out-soft)] ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {name && <input type="hidden" name={name} value={value} required={required} />}

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            data-lenis-prevent
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="scrollbar-thin absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-72 origin-top overflow-y-auto overscroll-contain rounded-2xl border border-line bg-paper p-1.5 shadow-[0_24px_60px_-20px_rgb(35_27_22/0.35)]"
          >
            {options.map((o, i) => {
              const isSel = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${id}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled}
                  onPointerEnter={() => !o.disabled && setActive(i)}
                  onClick={() => pick(i)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-[15px] transition-colors ${
                    o.disabled ? "cursor-not-allowed text-muted/40" : active === i ? "bg-butter text-ink" : "text-ink"
                  }`}
                >
                  <span>
                    {o.label}
                    {o.hint && <span className="ml-2 text-xs text-muted">{o.hint}</span>}
                  </span>
                  {isSel && (
                    <svg viewBox="0 0 20 20" className="size-4 text-seal" aria-hidden>
                      <path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
