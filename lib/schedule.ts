import type { Pool } from "./shop";

// Leon's bookable time, from his Google opening hours: one job at a time. Job lengths and
// travel between jobs are placeholders until he confirms them.
export const schedule = {
  timeZone: "Australia/Perth",
  offset: "+08:00", // Western Australia has no daylight saving
  // Jobs can start every half hour from 7:00.
  starts: Array.from({ length: 22 }, (_, i) => `${String(7 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`),
  // First start and last finish, by weekday (0 = Sunday); missing = no jobs.
  opens: { 1: "07:00", 2: "07:00", 3: "07:00", 4: "07:00", 5: "07:00", 6: "07:00" } as Record<number, string>,
  closes: { 1: "18:00", 2: "18:00", 3: "18:00", 4: "18:00", 5: "18:00", 6: "13:30" } as Record<number, string>,
  // Packing the truck and driving to the next job.
  bufferMinutes: 30,
  // Leon does every job himself.
  pools: { leon: [1] } as Record<Pool, number[]>,
  minNoticeMinutes: 180,
  maxDaysAhead: 60,
  closedDates: [] as string[], // e.g. "2026-12-25"
};

/** One person's booked time. */
export type Entry = { date: string; start: number; minutes: number; instructor: number };

const DAY_MS = 86_400_000;

export const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

const at = (date: string, time: string) => new Date(`${date}T${time}:00${schedule.offset}`);
const pad = (n: number) => String(n).padStart(2, "0");
export const toTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export function today(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: schedule.timeZone });
}

export function addDays(date: string, days: number) {
  return new Date(at(date, "12:00").getTime() + days * DAY_MS).toLocaleDateString("en-CA", { timeZone: schedule.timeZone });
}

export function describeDate(date: string) {
  return at(date, "12:00").toLocaleDateString("en-GB", {
    timeZone: schedule.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Closing time on a date, or null when there are no sessions. */
export function closingTime(date: string) {
  if (schedule.closedDates.includes(date)) return null;
  return schedule.closes[at(date, "12:00").getUTCDay()] ?? null;
}

/** People in a pool free for a whole session. */
export function freeInstructors(pool: Pool, date: string, start: number, minutes: number, entries: Entry[]) {
  const end = start + minutes + schedule.bufferMinutes;
  const busy = new Set(
    entries
      .filter((e) => e.date === date && start < e.start + e.minutes + schedule.bufferMinutes && e.start < end)
      .map((e) => e.instructor),
  );
  return schedule.pools[pool].filter((t) => !busy.has(t));
}

/** Start times on a date with enough people free, all finishing by closing time. */
export function freeSlots(pool: Pool, date: string, minutes: number, needed: number, entries: Entry[], now = new Date(), starts = schedule.starts) {
  const first = today(now);
  if (!isDate(date) || date < first || date > addDays(first, schedule.maxDaysAhead)) return [];
  const close = closingTime(date);
  if (!close) return [];
  const open = toMinutes(schedule.opens[at(date, "12:00").getUTCDay()] ?? "00:00");

  const earliest = now.getTime() + schedule.minNoticeMinutes * 60_000;
  return starts.filter((time) => {
    const m = toMinutes(time);
    return m >= open && m + minutes <= toMinutes(close) && at(date, time).getTime() >= earliest && freeInstructors(pool, date, m, minutes, entries).length >= needed;
  });
}

/** The first day after `date` with a free slot, for "nothing free that day". */
export function nextFreeDay(pool: Pool, date: string, minutes: number, needed: number, entries: Entry[], now = new Date(), starts = schedule.starts) {
  for (let i = 1; i <= schedule.maxDaysAhead; i++) {
    const next = addDays(isDate(date) ? date : today(now), i);
    const slots = freeSlots(pool, next, minutes, needed, entries, now, starts);
    if (slots.length) return { date: next, weekday: describeDate(next), free_times: slots };
  }
  return null;
}
