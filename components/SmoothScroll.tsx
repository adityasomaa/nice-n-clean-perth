"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";

type ScrollApi = {
  /** Jump (no animation) to an element or y position. Works with or without Lenis. */
  jump: (target: string | number) => void;
  /** Smoothly scroll to an element or y position (Lenis on desktop, native smooth scroll elsewhere). */
  glide: (target: string | number) => void;
  /** Lock page scroll while a popup that scrolls on its own is open. Ref-counted. */
  lock: () => void;
  unlock: () => void;
};

const ScrollContext = createContext<ScrollApi | null>(null);

// Lenis only on desktop with a fine pointer; tablets and phones keep native scroll.
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const locks = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => {
      if (mq.matches && !lenis.current) {
        lenis.current = new Lenis({ autoRaf: true, lerp: 0.09, anchors: false });
        if (locks.current > 0) lenis.current.stop();
      } else if (!mq.matches && lenis.current) {
        lenis.current.destroy();
        lenis.current = null;
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      lenis.current?.destroy();
      lenis.current = null;
    };
  }, []);

  const jump = useCallback((target: string | number) => {
    const y = targetY(target);
    if (lenis.current) lenis.current.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: "instant" });
  }, []);

  const glide = useCallback((target: string | number) => {
    // Wait two frames so a closing menu can release its scroll lock first.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const y = targetY(target);
        if (lenis.current) {
          const distance = Math.abs(y - window.scrollY);
          lenis.current.scrollTo(y, {
            force: true,
            duration: Math.min(1.8, 0.8 + distance / 4000),
            easing: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
          });
        } else {
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }),
    );
  }, []);

  const lock = useCallback(() => {
    locks.current += 1;
    lenis.current?.stop();
    document.documentElement.style.overflow = "hidden";
  }, []);

  const unlock = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1);
    if (locks.current === 0) {
      lenis.current?.start();
      document.documentElement.style.overflow = "";
    }
  }, []);

  return <ScrollContext value={{ jump, glide, lock, unlock }}>{children}</ScrollContext>;
}

function targetY(target: string | number) {
  if (typeof target === "number") return target;
  const el = document.querySelector<HTMLElement>(target);
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
}

export function useScroll() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScroll must be used inside <SmoothScroll>");
  return ctx;
}

/** Locks page scroll (and pauses Lenis) while `active` is true. */
export function useScrollLock(active: boolean) {
  const { lock, unlock } = useScroll();
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active, lock, unlock]);
}
