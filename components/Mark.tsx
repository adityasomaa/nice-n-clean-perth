import { useId } from "react";
import { MARK } from "./logo-paths";

// Nice N Clean's logo: the NNC mark (letters and the cleaner with his wand) is traced from their
// artwork and keeps its teal-to-blue gradient; "NICE N CLEAN" is set in Poppins beside it.

/** The NNC mark in its gradient: favicon, loader, chat avatar. */
export function Mark({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox={MARK.viewBox} className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#22c3b0" />
          <stop offset="1" stopColor="#2b6fe3" />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" fill={`url(#${id})`} d={MARK.d} />
    </svg>
  );
}

/** Mark beside "NICE N CLEAN / Carpet cleaning · est. 1981", sized by the className height. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span role="img" aria-label="Nice N Clean" className={`inline-flex items-center gap-[0.5em] leading-none ${className}`}>
      <Mark className="h-[1.6em] w-auto shrink-0" />
      <span className="flex flex-col">
        <span className="font-display text-[1em] font-bold tracking-[0.04em]">NICE N CLEAN</span>
        <span className="mt-[0.3em] text-[0.42em] font-semibold uppercase tracking-[0.3em] opacity-60">Carpet cleaning · est. 1981</span>
      </span>
    </span>
  );
}

/** Kept so components from the template keep working. */
export const Wordmark = Logo;
export const Emblem = Mark;
export const Plate = Mark;
export const Paw = Mark;
