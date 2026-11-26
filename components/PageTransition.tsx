"use client";

import { animate } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useScroll } from "./SmoothScroll";
import { Emblem } from "./Mark";

const EASE = [0.76, 0, 0.24, 1] as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type TransitionApi = { go: (href: string) => void; ready: boolean };
const TransitionContext = createContext<TransitionApi>({ go: () => {}, ready: false });

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { jump, glide } = useScroll();
  const curtain = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const busy = useRef(true);
  const pendingPath = useRef<{ path: string; resolve: () => void } | null>(null);
  const [ready, setReady] = useState(false);

  const slow = useRef(1);

  const open = useCallback(async () => {
    const d = slow.current;
    // Wordmark fades while the curtain is already lifting — no dead time between the two.
    animate(mark.current!, { opacity: [1, 0], y: [0, -16] }, { duration: 0.25 * d, ease: EASE });
    await animate(curtain.current!, { y: ["0%", "-100%"] }, { duration: 0.8 * d, delay: 0.08 * d, ease: EASE });
    curtain.current!.style.visibility = "hidden";
  }, []);

  const close = useCallback(async () => {
    const d = slow.current;
    const el = curtain.current!;
    el.style.visibility = "visible";
    animate(mark.current!, { opacity: [0, 1], y: [16, 0] }, { duration: 0.3 * d, delay: 0.35 * d, ease: EASE });
    await animate(el, { y: ["100%", "0%"] }, { duration: 0.7 * d, ease: EASE });
  }, []);

  // First load: curtain starts closed (SSR), counts up while fonts settle, then opens.
  // Only fonts are awaited (images are next/image-optimised and the hero one is priority);
  // capped so a slow network never holds the curtain shut.
  useEffect(() => {
    slow.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.3 : 1;
    let cancelled = false;
    const settled = Promise.race([document.fonts.ready, wait(1500)]);
    const count = animate(0, 100, {
      duration: 0.7 * slow.current,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => counter.current && (counter.current.textContent = String(Math.round(v)).padStart(3, "0")),
    });

    (async () => {
      await Promise.all([settled, count]);
      if (cancelled) return;
      jump(0);
      document.documentElement.classList.remove("is-loading");
      setReady(true);
      await open();
      busy.current = false;
    })();
    return () => {
      cancelled = true;
      count.stop();
    };
  }, [jump, open]);

  // Resolve a pending route change once the new pathname has rendered.
  useEffect(() => {
    if (pendingPath.current && pendingPath.current.path === pathname) {
      pendingPath.current.resolve();
      pendingPath.current = null;
    }
  }, [pathname]);

  const go = useCallback(
    async (href: string) => {
      if (busy.current) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }
      // Same page (section links, logo on home): just glide there — the curtain is for real page changes.
      if (url.pathname === window.location.pathname) {
        glide(url.hash || 0);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
        return;
      }
      busy.current = true;
      await close();

      // Everything below happens while the page is covered.
      if (url.pathname !== window.location.pathname) {
        await new Promise<void>((resolve) => {
          pendingPath.current = { path: url.pathname, resolve };
          router.push(url.pathname + url.search, { scroll: false });
        });
      }
      jump(0);
      if (url.hash) jump(url.hash);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
      await wait(120);

      await open();
      busy.current = false;
    },
    [close, open, jump, glide, router],
  );

  return (
    <TransitionContext value={{ go, ready }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="fixed inset-0 z-[100] flex items-center justify-center bg-night text-bone will-change-transform"
      >
        {/* The NNC mark */}
        <div ref={mark} className="flex flex-col items-center gap-7">
          <Emblem className="size-[min(40vw,170px)] text-gold" />
          <span className="flex items-center gap-3 font-tag text-[11px] uppercase tracking-[0.3em] text-bone/70">
            Carpet cleaning · Perth
            <span ref={counter} className="tabular-nums text-gold">
              000
            </span>
          </span>
        </div>
      </div>
    </TransitionContext>
  );
}

export const useTransition = () => useContext(TransitionContext);

/** Internal link: smooth-scrolls within the page; runs the close → change → scroll top → open curtain for other pages. */
export function TransitionLink({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { go } = useTransition();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(href);
  };
  return <a href={href} onClick={handle} {...rest} />;
}
