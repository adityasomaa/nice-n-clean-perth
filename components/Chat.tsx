"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { shop, smsLink } from "@/lib/shop";
import { useScrollLock } from "./SmoothScroll";
import { Emblem } from "./Mark";

type Msg = { role: "user" | "assistant"; content: string };

const ChatContext = createContext<{ openChat: (question?: string) => void }>({ openChat: () => {} });
export const useChat = () => useContext(ChatContext);

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi, I'm Leon's virtual assistant at Nice N Clean. Tell me what needs cleaning and your suburb, and I'll book Leon in right here, any time of day.",
};
const SUGGESTIONS = ["Book a carpet clean", "How much for 3 bedrooms?", "Can you get pet stains out?", "Moving out clean"];
const MAX_INPUT = 600;
const MAX_QUESTIONS = 20;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const queued = useRef<string | null>(null);
  const asked = messages.filter((m) => m.role === "user").length;
  const limitReached = asked >= MAX_QUESTIONS;
  useScrollLock(open);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => field.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => (clearTimeout(t), window.removeEventListener("keydown", onKey));
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, MAX_INPUT);
      if (!q || pending || limitReached) return;
      const history = [...messages.filter((m) => m !== GREETING), { role: "user" as const, content: q }];
      setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
      setInput("");
      setPending(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Odd count keeps the window starting on a user turn
          body: JSON.stringify({ messages: history.slice(-11) }),
        });
        if (!res.ok || !res.body) {
          const msg =
            res.status === 429
              ? "You're sending messages a little fast — please try again in a minute."
              : `Sorry, I can't answer right now. Please call or text the team on ${shop.phoneDisplay}.`;
          setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: msg }]);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const snapshot = acc;
          setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: snapshot }]);
        }
        if (!acc.trim()) {
          setMessages((m) => [
            ...m.slice(0, -1),
            { role: "assistant", content: `Sorry, I couldn't answer that. Please call or text the team on ${shop.phoneDisplay}.` },
          ]);
        }
      } catch {
        setMessages((m) => [
          ...m.slice(0, -1),
          { role: "assistant", content: `Connection lost. Please try again, or call or text the team on ${shop.phoneDisplay}.` },
        ]);
      } finally {
        setPending(false);
      }
    },
    [messages, pending, limitReached],
  );

  // A question passed to openChat() is sent once the panel is open.
  useEffect(() => {
    if (open && queued.current) {
      const q = queued.current;
      queued.current = null;
      send(q);
    }
  }, [open, send]);

  const openChat = useCallback((question?: string) => {
    if (question) queued.current = question;
    setOpen(true);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <ChatContext value={{ openChat }}>
      {children}

      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 right-4 z-[70] flex items-center gap-3 rounded-full bg-brass p-2 font-semibold text-night shadow-[0_20px_50px_-15px_rgb(0_0_0/0.7)] transition-colors hover:bg-gold-deep sm:bottom-6 sm:right-6 sm:pr-5"
            aria-label="Open chat with Nice N Clean's assistant"
          >
            <span className="relative grid size-10 place-items-center rounded-full bg-night/10">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <path
                  d="M4 12a8 8 0 1 1 3.2 6.4L4 19.5l1.1-3.1A7.9 7.9 0 0 1 4 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute right-0.5 top-0.5 size-2.5 rounded-full border-2 border-brass bg-[#22c55e]" />
            </span>
            <span className="hidden text-sm sm:inline">Ask our receptionist</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Chat with Nice N Clean's assistant"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[80] flex origin-bottom-right flex-col overflow-hidden bg-paper sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100dvh-48px))] sm:w-[400px] sm:rounded-[28px] sm:border sm:border-line sm:shadow-[0_40px_100px_-30px_rgb(0_0_0/0.8)]"
          >
            <header className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-paper">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-steel text-gold"><Emblem className="size-7" /></span>
                <div>
                  <p className="font-display text-[19px] font-bold leading-none tracking-[0.02em]">NICE N CLEAN</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-cream/70">
                    <span className="size-1.5 rounded-full bg-[#7fd39b]" /> Virtual receptionist
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={smsLink()}
                  className="rounded-full px-3 py-2 text-xs text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  Text us
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="grid size-9 place-items-center rounded-full transition-colors hover:bg-cream/10"
                >
                  <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </header>

            <div
              ref={list}
              data-lenis-prevent
              className="scrollbar-thin flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5"
              aria-live="polite"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${
                      m.role === "user" ? "rounded-br-md bg-ink text-paper" : "rounded-bl-md bg-cream text-ink"
                    }`}
                  >
                    {m.content || (
                      <span className="flex gap-1 py-1.5" aria-label="Typing">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            className="size-1.5 rounded-full bg-muted"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                          />
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-line px-3.5 py-2 text-[13px] text-ink/80 transition-colors hover:border-seal hover:bg-butter"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {limitReached ? (
              <div className="border-t border-line p-4 text-center text-sm text-ink/80">
                That&apos;s the limit for this chat. The team can help with anything else:{" "}
                <a
                  href={smsLink()}
                  className="underline underline-offset-4"
                >
                  text {shop.phoneDisplay}
                </a>
                .
              </div>
            ) : (
            <form onSubmit={submit} className="flex items-end gap-2 border-t border-line p-3">
              <label htmlFor="chat-input" className="sr-only">
                Your message
              </label>
              <textarea
                id="chat-input"
                ref={field}
                rows={1}
                value={input}
                maxLength={MAX_INPUT}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Type your question…"
                data-lenis-prevent
                className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl bg-cream px-4 py-3 text-[15px] outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-seal/40"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-cream transition-colors hover:bg-ink disabled:opacity-40"
              >
                <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                  <path d="M10 16V4M5 9l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </form>
            )}
            <p className="px-4 pb-3 text-center text-[11px] text-muted">
              AI assistant. Your booking goes straight into Leon&apos;s calendar.
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </ChatContext>
  );
}
