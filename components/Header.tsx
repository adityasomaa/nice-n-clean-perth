"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Wordmark } from "./Mark";
import { TransitionLink } from "./PageTransition";
import { useScrollLock } from "./SmoothScroll";

const nav = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
    { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useScrollLock(menu);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-bone transition-[background-color,box-shadow,padding] duration-500 ${
          scrolled ? "bg-night/85 py-2.5 shadow-[0_1px_0_var(--color-rule)] backdrop-blur-md" : "py-5"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-8">
          <TransitionLink href="/" className="flex items-center" aria-label="Nice N Clean — home">
            <Wordmark className={`text-bone transition-[font-size] duration-500 ${scrolled ? "text-[17px]" : "text-[18px] sm:text-[20px]"}`} />
          </TransitionLink>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {nav.map((n) => (
              <TransitionLink
                key={n.href}
                href={n.href}
                className="relative text-[15px] font-medium text-bone/80 transition-colors hover:text-bone after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100"
              >
                {n.label}
              </TransitionLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <TransitionLink
              href="#book"
              className="hidden rounded-full bg-brass px-5 py-2.5 text-[15px] font-semibold text-night transition-colors hover:bg-gold-deep sm:inline-block"
            >
              Book a clean
            </TransitionLink>
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-label={menu ? "Close menu" : "Open menu"}
              className="relative grid size-11 place-items-center rounded-full border border-rule bg-night/40 lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-500 ${menu ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-500 ${menu ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* Sibling of <header>, not a child: once scrolled the header gets backdrop-filter,
          which makes it the containing block for fixed children — the overlay was then
          clipped to the header's height. It sits just under the header so the X stays on top. */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
            className="fixed inset-0 z-[45] flex flex-col justify-between overflow-y-auto bg-night px-4 pb-10 pt-28 text-bone lg:hidden"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {[...nav, { href: "#book", label: "Book" }].map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TransitionLink href={n.href} onClick={() => setMenu(false)} className="block border-b border-rule py-4 font-display text-[30px]">
                    {n.label}
                  </TransitionLink>
                </motion.div>
              ))}
            </nav>
            {/* Right padding keeps the line clear of the floating chat button */}
            <p className="pr-16 text-[15px] text-ash">Level 13, 37 St Georges Tce, Perth · By appointment, every day 10–5</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
